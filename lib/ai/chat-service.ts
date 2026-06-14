// 业务 service 层
// 职责：
//   1. 读 env 注入 LLM 客户端配置（API Key 只走 env，永不进前端）
//   2. 注入角色 system prompt
//   3. 调用底层 llm-client
//   4. 业务参数调优（temperature / max_tokens）
// 调用方：app/api/chat/route.ts（不直接被页面调用）
// 守：server-only 防止前端误 import
import "server-only";
import { readFileSync } from "fs";
import { resolve } from "path";
import type { CharacterId, ChatMessage } from "./types";
import { streamLlm, type StreamResult, type StreamChunk } from "./llm-client";
import { LlmError } from "./types";

/** 直接读 .env.local 文件，绕过操作系统环境变量缓存 */
function readEnvLocal(key: string): string | undefined {
  try {
    const content = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

/** 业务入参：调用方（route）只关心业务字段，不关心 model / key */
export interface StreamCharacterChatInput {
  characterId: CharacterId;
  systemPrompt: string;
  messages: ChatMessage[];
  /** 业务可选参数 */
  temperature?: number;
  maxTokens?: number;
}

/** 业务出参：与底层一致，但加上 characterId 便于日志关联 */
export interface StreamCharacterChatResult {
  characterId: CharacterId;
  stream: AsyncGenerator<StreamChunk, void, unknown>;
  usage: Promise<{ prompt: number; completion: number; total: number } | null>;
}

/** 从 env 读取 LLM 配置；缺 Key 抛 LlmError 401 给上层 */
export function getLlmConfig(): {
  apiKey: string;
  baseUrl: string;
  model: string;
} {
  const apiKey =
    readEnvLocal("ARK_API_KEY") ??
    process.env.ARK_API_KEY ??
    process.env.SEEDREAM_API_KEY;
  const baseUrl =
    readEnvLocal("ARK_BASE_URL") ??
    process.env.ARK_BASE_URL ??
    process.env.SEEDREAM_BASE_URL ??
    "https://ark.cn-beijing.volces.com/api/v3";
  const model =
    readEnvLocal("ARK_LLM_MODEL") ??
    process.env.ARK_LLM_MODEL ??
    process.env.SEEDREAM_MODEL ??
    "doubao-seed-character-251128";

  if (!apiKey) {
    throw new LlmError(
      "config",
      "ARK_API_KEY not configured (please set in .env.local)",
      500
    );
  }
  return { apiKey, baseUrl, model };
}

/** 内部 alias，保持 readLlmConfig 调用不变 */
function readLlmConfig() {
  return getLlmConfig();
}

/**
 * 业务入口：发起一次角色对话流式调用。
 * 调用方负责把 AsyncGenerator 包装成 SSE / ReadableStream。
 */
export function streamCharacterChat(
  input: StreamCharacterChatInput
): StreamCharacterChatResult {
  const config = readLlmConfig();

  console.log(
    `[chat-service] character=${input.characterId} model=${config.model} messages=${input.messages.length}`
  );

  const result: StreamResult = streamLlm(input.systemPrompt, input.messages, {
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    temperature: input.temperature,
    maxTokens: input.maxTokens,
  });

  return {
    characterId: input.characterId,
    stream: result.stream,
    usage: result.usage,
  };
}
