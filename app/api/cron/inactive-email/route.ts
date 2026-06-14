// Vercel Cron 调用：找出 3 天未活跃用户，发送角色口吻邮件
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { users, conversations, characterState } from "@/lib/db/schema";
import { and, desc, eq, lt, sql } from "drizzle-orm";
import { sendEmail, getOrCreateUnsubscribeToken, isUnsubscribed } from "@/lib/email/resend";
import { inactiveEmail } from "@/lib/email/templates";
import { CHARACTERS } from "@/lib/ai/characters";
import type { CharacterId } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 频率限制：每个 (user, character) 30 天内只发 1 封
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;
const INACTIVE_MS = 3 * 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  // 鉴权
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const cutoff = new Date(Date.now() - INACTIVE_MS);

  // 取所有启用了邮件订阅 + 有角色状态的用户
  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.emailOptIn, true));

  let sent = 0;
  const errors: string[] = [];

  for (const user of allUsers) {
    if (!user.email) continue;
    if (await isUnsubscribed(user.email)) continue;

    // 找最近 active 的 character（按 updatedAt desc 取第一个）
    const states = await db
      .select()
      .from(characterState)
      .where(eq(characterState.userId, user.id))
      .orderBy(desc(characterState.updatedAt))
      .limit(1);

    const state = states[0];
    if (!state) continue;

    // 如果状态更新时间 < 3 天前，不发
    const updatedAt = new Date(state.updatedAt);
    if (updatedAt > cutoff) continue;

    // 冷却：上一次拉活邮件时间用 lastSeenAt 粗略判断
    if (user.lastSeenAt && Date.now() - new Date(user.lastSeenAt).getTime() < COOLDOWN_MS) {
      continue;
    }

    const character = CHARACTERS.find((c) => c.id === state.characterId);
    if (!character) continue;

    const token = await getOrCreateUnsubscribeToken(user.email);
    const unsubUrl = `${appUrl}/api/unsubscribe?token=${token}`;

    const email = inactiveEmail({
      characterId: character.id as CharacterId,
      characterName: character.name,
      userName: user.name ?? undefined,
      unsubscribeUrl: unsubUrl,
      appUrl,
    });

    const result = await sendEmail({
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    if (result.ok) {
      sent++;
      // 更新 lastSeenAt 触发冷却
      await db
        .update(users)
        .set({ lastSeenAt: new Date() })
        .where(eq(users.id, user.id));
    } else {
      errors.push(`${user.email}: ${result.error}`);
    }
  }

  return NextResponse.json({ sent, errors, total: allUsers.length });
}
