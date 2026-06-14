// seedream 文生图（字节跳动豆包）
// 服务端专用：守：server-only
import "server-only";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { CharacterId } from "@/lib/ai/types";
import {
  LlmError,
  LlmAuthError,
  LlmRateLimitError,
  LlmTimeoutError,
  LlmNetworkError,
  LlmUpstreamError,
} from "@/lib/ai/types";

// =============================================================
// 配置读取（优先 .env.local 文件，绕过 OS 环境变量缓存）
// =============================================================
function readEnvLocal(key: string): string | undefined {
  const envPath = resolve(process.cwd(), ".env.local");
  try {
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
    return match?.[1]?.trim();
  } catch (e) {
    console.error(`[DEBUG-image] readEnvLocal failed for ${key} at ${envPath}:`, e instanceof Error ? e.message : String(e));
    return undefined;
  }
}

function getImageConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  const apiKey =
    readEnvLocal("SEEDREAM_API_KEY") ||
    process.env.SEEDREAM_API_KEY ||
    readEnvLocal("ARK_API_KEY") ||
    process.env.ARK_API_KEY;
  const baseUrl =
    readEnvLocal("SEEDREAM_BASE_URL") ||
    process.env.SEEDREAM_BASE_URL ||
    "https://ark.cn-beijing.volces.com/api/v3";
  const model =
    readEnvLocal("SEEDREAM_IMAGE_MODEL") ||
    process.env.SEEDREAM_IMAGE_MODEL ||
    "doubao-seedream-4-0-250828";

  if (!apiKey) {
    throw new LlmError(
      "config",
      "SEEDREAM_API_KEY / ARK_API_KEY not configured (please set in .env.local)",
      500
    );
  }
  return { apiKey, baseUrl, model };
}

// =============================================================
// 通用文生图
// =============================================================
export interface GenerateImageInput {
  prompt: string;
  size?: "2K" | "1024x1024" | "1024x1536" | "1536x1024";
  watermark?: boolean;
}

export interface GenerateImageResult {
  url: string;
  size: string;
}

const REQUEST_TIMEOUT_MS = 60_000;

export async function generateImage(
  input: GenerateImageInput
): Promise<GenerateImageResult> {
  const config = getImageConfig();
  const reqId = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();

  console.log(
    `[seedream] req=${reqId} start model=${config.model} size=${input.size ?? "2K"} promptLen=${input.prompt.length}`
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        prompt: input.prompt,
        size: input.size ?? "2K",
        response_format: "url",
        stream: false,
        watermark: input.watermark ?? true,
        sequential_image_generation: "disabled",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - startedAt;

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      if (response.status === 401 || response.status === 403) {
        console.error(
          `[seedream] req=${reqId} error status=${response.status} type=auth elapsed=${elapsed}ms body=${errText.slice(0, 200)}`
        );
        throw new LlmAuthError(
          `Auth failed: ${response.status} ${response.statusText} - ${errText.slice(0, 300)}`,
          response.status
        );
      }
      if (response.status === 429) {
        console.warn(
          `[seedream] req=${reqId} error status=429 type=rate_limit elapsed=${elapsed}ms body=${errText.slice(0, 200)}`
        );
        throw new LlmRateLimitError(
          `Rate limited: ${response.status} ${response.statusText} - ${errText.slice(0, 300)}`,
          response.status
        );
      }
      console.error(
        `[seedream] req=${reqId} error status=${response.status} type=upstream elapsed=${elapsed}ms body=${errText.slice(0, 200)}`
      );
      throw new LlmUpstreamError(
        `Upstream error: ${response.status} ${response.statusText} - ${errText.slice(0, 300)}`,
        response.status
      );
    }

    const json = (await response.json()) as {
      data?: Array<{ url?: string; size?: string }>;
    };
    const item = json.data?.[0];
    if (!item?.url) {
      throw new LlmUpstreamError("Empty image url in response", response.status);
    }

    console.log(
      `[seedream] req=${reqId} done url=${item.url.slice(0, 60)}... size=${item.size ?? "unknown"} elapsed=${elapsed}ms`
    );
    return { url: item.url, size: item.size ?? "unknown" };
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof LlmError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new LlmTimeoutError(
        `Request aborted after ${REQUEST_TIMEOUT_MS}ms (model=${config.model})`
      );
    }
    throw new LlmNetworkError(
      `Network error: ${err instanceof Error ? err.message : String(err)} (model=${config.model})`
    );
  }
}

// =============================================================
// 角色立绘（兼容旧代码）
// =============================================================
export interface PortraitResult {
  url: string;
}

const CHARACTER_VISUAL_ANCHOR: Record<CharacterId, string> = {
  "lin-xu-bai":
    "22-25 year old East Asian man, soft brown hair, gentle eyes, warm autumn light, knit sweater, holding a paper cup of coffee, slightly blurred background, anime-influenced realism, soft cinematic color grading",
  "zhou-mu":
    "28-32 year old East Asian man, sharp jawline, black tailored suit, dark hair slicked back, cold eyes, standing by floor-to-ceiling window in a high-rise office at night, city lights reflecting, cinematic noir",
  "jiang-yu":
    "27-30 year old East Asian man, modern tech founder aesthetic, blue-black hoodie, laptop visible, programmer with intelligent gaze, slightly tired eyes, white earbuds, minimalist office background, cool blue ambient light",
  "xia-ye":
    "22-25 year old East Asian man, tanned skin, messy dark hair, big smile, wearing a bright yellow t-shirt and worn-out jeans, small-town vibe, sunset sky background, candid photo style, warm saturated colors",
};

export async function generatePortrait(
  characterId: CharacterId
): Promise<PortraitResult | null> {
  try {
    const result = await generateImage({
      prompt: CHARACTER_VISUAL_ANCHOR[characterId],
      size: "1024x1024",
    });
    return { url: result.url };
  } catch (err) {
    console.error(`[seedream] generatePortrait failed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}
