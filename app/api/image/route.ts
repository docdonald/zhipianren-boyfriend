// /api/image - 文生图端点（生成后自动转存 R2）
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage } from "@/lib/image/seedream";
import { LlmError } from "@/lib/ai/types";
import { auth } from "@/lib/auth";
import { uploadToR2 } from "@/lib/r2";
import { db } from "@/lib/db/client";
import { generatedImages } from "@/lib/db/schema";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  prompt: z.string().min(1).max(500),
  size: z.enum(["2K", "1024x1024", "1024x1536", "1536x1024"]).optional(),
  watermark: z.boolean().optional(),
  characterId: z.string().optional(), // 可选：哪个角色对话中生成的
  image: z.string().optional(), // 可选：参考图（base64 或 URL）
});

export async function POST(req: NextRequest) {
  // 1. 解析请求体
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bad request", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { prompt, size, watermark, characterId, image } = parsed.data;

  // 2. 调用 AI 生成图片
  let tempResult: { url: string; size: string };
  try {
    tempResult = await generateImage({ prompt, size, watermark, image });
  } catch (err) {
    if (err instanceof LlmError) {
      console.error(
        `[image-route] generate error type=${err.type} status=${err.status} msg=${err.message}`
      );
      return NextResponse.json(
        {
          error: err.message,
          errorType: err.type,
          status: err.status,
          retriable: err.retriable,
        },
        { status: err.status }
      );
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[image-route] generate unexpected error: ${message}`);
    return NextResponse.json(
      { error: "Image generation failed", errorType: "unknown" },
      { status: 500 }
    );
  }

  // 3. 获取当前用户（未登录则直接返回临时链接，兼容旧行为）
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(tempResult);
  }

  // 4. 下载临时图片并转存 R2
  try {
    const imageResponse = await fetch(tempResult.url);
    if (!imageResponse.ok) {
      throw new Error(
        `Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`
      );
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    const fileName = `images/${nanoid()}.png`;
    const permanentUrl = await uploadToR2(imageBuffer, fileName, "image/png");

    // 5. 写入数据库
    await db.insert(generatedImages).values({
      userId: session.user.id,
      characterId: characterId ?? null,
      imageUrl: permanentUrl,
      prompt,
      size: tempResult.size,
    });

    console.log(
      `[image-route] saved to R2 user=${session.user.id} char=${characterId ?? "-"} url=${permanentUrl}`
    );

    return NextResponse.json({ url: permanentUrl, size: tempResult.size });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[image-route] R2 upload failed: ${message}`);
    // R2 失败时回退到返回临时链接，不阻断用户
    return NextResponse.json(tempResult);
  }
}
