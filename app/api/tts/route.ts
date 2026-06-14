// TTS 端点：POST { characterId, text } -> audio/mpeg
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { synthesizeSpeech } from "@/lib/tts/volcengine";
import { auth } from "@/lib/auth";
import type { CharacterId } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  characterId: z.enum(["lin-xu-bai", "zhou-mu", "jiang-yu", "xia-ye"]),
  text: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { characterId, text } = parsed.data;
  const result = await synthesizeSpeech(text, characterId as CharacterId);

  if (!result) {
    return NextResponse.json(
      { error: "tts_unavailable", message: "TTS 服务未配置或调用失败" },
      { status: 503 }
    );
  }

  return new Response(result.audio, {
    headers: {
      "Content-Type": result.contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}
