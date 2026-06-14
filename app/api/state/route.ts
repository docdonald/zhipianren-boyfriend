// 获取当前用户的角色 state（前端轮询亲密度变化）
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { characterState } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = new Set(["lin-xu-bai", "zhou-mu", "jiang-yu", "xia-ye"]);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id?: string }).id;
  if (!userId) {
    return NextResponse.json({ error: "no user id" }, { status: 401 });
  }

  const characterId = req.nextUrl.searchParams.get("characterId");
  if (!characterId || !VALID.has(characterId)) {
    return NextResponse.json({ error: "invalid characterId" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(characterState)
    .where(
      and(
        eq(characterState.userId, userId),
        eq(characterState.characterId, characterId)
      )
    )
    .limit(1);

  if (!rows[0]) {
    return NextResponse.json({ stage: 1, score: 0 });
  }
  return NextResponse.json({
    stage: rows[0].intimacyStage,
    score: rows[0].intimacyScore,
  });
}
