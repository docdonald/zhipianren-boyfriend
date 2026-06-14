// /api/chat/claim - 登录后把匿名试用历史迁移到服务端
// 客户端在登录态变化时调用，传入 localStorage 中的匿名消息
// 服务端写入 conversation 表，标记为匿名试用（intimacyStage = 1）
import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { conversations, characterState } from "@/lib/db/schema";
import { and, count, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  characterId: z.enum(["lin-xu-bai", "zhou-mu", "jiang-yu", "xia-ye"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(4000),
      })
    )
    .max(100),
});

export async function POST(req: NextRequest) {
  // 必须登录才能 claim
  const session = await auth();
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return new Response(JSON.stringify({ error: "no user id" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid request",
        details: parsed.error.flatten(),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { characterId, messages } = parsed.data;
  if (messages.length === 0) {
    return new Response(JSON.stringify({ ok: true, claimed: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 确保 character_state 存在
    const states = await db
      .select()
      .from(characterState)
      .where(
        and(
          eq(characterState.userId, userId),
          eq(characterState.characterId, characterId)
        )
      )
      .limit(1);

    if (states.length === 0) {
      await db.insert(characterState).values({
        userId,
        characterId,
        intimacyStage: 1,
        intimacyScore: 0,
        characterData: {},
      });
    }

    // 检查是否已存在服务端历史（避免重复）
    const existing = await db
      .select({ c: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.characterId, characterId)
        )
      );
    const existingCount = existing[0]?.c ?? 0;
    if (existingCount > 0) {
      // 服务端已有历史，跳过 claim（避免重复污染）
      return new Response(
        JSON.stringify({
          ok: true,
          claimed: 0,
          skipped: messages.length,
          reason: "server_history_exists",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 写入匿名历史（标记为 stage 1，score 0）
    const now = Date.now();
    const rows = messages.map((m, i) => ({
      userId,
      characterId,
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
      intimacyStage: 1,
      createdAt: new Date(now + i), // 保持顺序
    }));
    await db.insert(conversations).values(rows);

    // 更新 score 为消息数（粗略估算）
    await db
      .update(characterState)
      .set({
        intimacyScore: rows.length,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(characterState.userId, userId),
          eq(characterState.characterId, characterId)
        )
      );

    return new Response(
      JSON.stringify({ ok: true, claimed: rows.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[chat/claim] error", e);
    return new Response(
      JSON.stringify({ error: "claim_failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
