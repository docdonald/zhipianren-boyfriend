// 立绘生成端点 - 用 seedream-5 锁定角色形象
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generatePortrait } from "@/lib/image/seedream";
import type { CharacterId } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID = new Set<CharacterId>([
  "lin-xu-bai",
  "zhou-mu",
  "jiang-yu",
  "xia-ye",
]);

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("characterId");
  if (!id || !VALID.has(id as CharacterId)) {
    return NextResponse.json({ error: "invalid characterId" }, { status: 400 });
  }

  const result = await generatePortrait(id as CharacterId);
  if (!result) {
    return NextResponse.json(
      { error: "seedream_unavailable" },
      { status: 503 }
    );
  }
  return NextResponse.json(result);
}
