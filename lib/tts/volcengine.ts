// 火山引擎 TTS（服务端专用）
// 守：server-only
import "server-only";
// 文档：https://www.volcengine.com/docs/6561/79817
// 大模型语音 API：https://www.volcengine.com/docs/6561/1257543
// 简单实现：使用 HTTP REST + 临时 token

import type { CharacterId } from "@/lib/ai/types";

const VOICE_MAP: Record<CharacterId, string> = {
  "lin-xu-bai": process.env.TTS_VOICE_LIN ?? "zh_male_shuangkuai",
  "zhou-mu": process.env.TTS_VOICE_ZHOU ?? "zh_male_chunhou",
  "jiang-yu": process.env.TTS_VOICE_JIANG ?? "zh_male_ruxin",
  "xia-ye": process.env.TTS_VOICE_XIA ?? "zh_male_yangguang",
};

export interface TtsResult {
  audio: ArrayBuffer;
  contentType: string;
}

export async function synthesizeSpeech(
  text: string,
  characterId: CharacterId
): Promise<TtsResult | null> {
  const appId = process.env.VOLCENGINE_APP_ID;
  const accessKey = process.env.VOLCENGINE_ACCESS_KEY;
  const secretKey = process.env.VOLCENGINE_SECRET_KEY;
  if (!appId || !accessKey || !secretKey) {
    return null;
  }

  const voice = VOICE_MAP[characterId];

  // 大模型 TTS REST 端点（v3）
  const url = "https://openspeech.bytedance.com/api/v3/tts/unidirectional";
  const req = {
    app: { appid: appId, token: "access_token", cluster: "volcano_tts" },
    user: { uid: "pb-user" },
    audio: {
      voice_type: voice,
      encoding: "mp3",
      speed_ratio: 1.0,
      volume_ratio: 1.0,
      pitch_ratio: 1.0,
    },
    request: {
      reqid: crypto.randomUUID(),
      text,
      text_type: "plain",
      operation: "query",
      with_frontend: 1,
      frontend_type: "unitTson",
    },
  };

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessKey};${secretKey}`,
      },
      body: JSON.stringify(req),
    });

    if (!resp.ok) return null;
    return {
      audio: await resp.arrayBuffer(),
      contentType: "audio/mpeg",
    };
  } catch {
    return null;
  }
}
