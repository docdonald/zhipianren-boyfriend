// /api/image - 文生图端点
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateImage } from "@/lib/image/seedream";
import { LlmError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  prompt: z.string().min(1).max(500),
  size: z.enum(["2K", "1024x1024", "1024x1536", "1536x1024"]).optional(),
  watermark: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
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

  const { prompt, size, watermark } = parsed.data;

  try {
    const result = await generateImage({ prompt, size, watermark });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof LlmError) {
      console.error(`[image-route] type=${err.type} status=${err.status} msg=${err.message}`);
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
    console.error(`[image-route] unexpected error: ${message}`);
    return NextResponse.json(
      { error: "Internal server error", errorType: "unknown" },
      { status: 500 }
    );
  }
}
