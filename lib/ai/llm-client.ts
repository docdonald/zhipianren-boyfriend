// 底层 OpenAI 兼容 HTTP 客户端
// - 协议：火山方舟 Ark（OpenAI Chat Completions 兼容）
// - 调用方：chat-service（不知道也不关心业务）
// - 错误：401/429/timeout/网络/上游 5xx → 抛 LlmError 族
// - 日志：[LLM] 前缀，含耗时 + token 用量
// - 守：import "server-only" 阻止前端误 import（编译期报错）
import "server-only";
import type { ChatMessage } from "./types";
import {
  LlmError,
  LlmAuthError,
  LlmRateLimitError,
  LlmTimeoutError,
  LlmNetworkError,
  LlmUpstreamError,
} from "./types";

/** 单次 fetch 总超时（毫秒） */
const REQUEST_TIMEOUT_MS = 30_000;

export interface LlmClientConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface StreamChunk {
  /** 增量内容 */
  content: string;
  /** 当前 chunk 来自 SSE 的原始 JSON（如有） */
  raw?: unknown;
}

export interface StreamResult {
  /** 异步迭代器：增量文本 */
  stream: AsyncGenerator<StreamChunk, void, unknown>;
  /** 完成后可读到的 token 用量（如上游返回）。streamLlm 总会 resolve 为此值 */
  usage: Promise<{ prompt: number; completion: number; total: number } | null>;
}

/**
 * 发起一次 LLM 流式调用，返回异步迭代器。
 * 出错时抛 LlmError 族。
 */
export function streamLlm(
  systemPrompt: string,
  messages: ChatMessage[],
  config: LlmClientConfig
): StreamResult {
  // 1. 拼装 messages
  const reqMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    { role: "system", content: systemPrompt },
    ...messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
  ];

  const startedAt = Date.now();
  const reqId = Math.random().toString(36).slice(2, 8);
  console.log(
    `[LLM] req=${reqId} start model=${config.model} messages=${reqMessages.length}`
  );

  // 2. 启动 fetch（带 AbortController）
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // 上游用量的 holder（在 stream 结束后由外层 .done() 读取）
  let usage: { prompt: number; completion: number; total: number } | null = null;
  let aborted = false;

  const fetchPromise = fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: reqMessages,
      stream: true,
      temperature: config.temperature ?? 0.85,
      max_tokens: config.maxTokens ?? 800,
    }),
    signal: controller.signal,
  }).catch((err) => {
    clearTimeout(timeout);
    // 区分 abort / 网络错误
    if (err?.name === "AbortError") {
      aborted = true;
      throw new LlmTimeoutError(
        `Request aborted after ${REQUEST_TIMEOUT_MS}ms (model=${config.model})`
      );
    }
    throw new LlmNetworkError(
      `Network error: ${err?.message ?? String(err)} (model=${config.model})`
    );
  });

  const stream = (async function* () {
    try {
      const response = await fetchPromise;

      if (!response.ok) {
        clearTimeout(timeout);
        const errText = await response.text().catch(() => "");
        const elapsed = Date.now() - startedAt;
        // 错误分类
        if (response.status === 401 || response.status === 403) {
          console.error(
            `[LLM] req=${reqId} error status=${response.status} type=auth elapsed=${elapsed}ms body=${errText.slice(0, 200)}`
          );
          throw new LlmAuthError(
            `Auth failed: ${response.status} ${response.statusText} - ${errText.slice(0, 300)}`,
            response.status
          );
        }
        if (response.status === 429) {
          console.warn(
            `[LLM] req=${reqId} error status=429 type=rate_limit elapsed=${elapsed}ms body=${errText.slice(0, 200)}`
          );
          throw new LlmRateLimitError(
            `Rate limited: ${response.status} ${response.statusText} - ${errText.slice(0, 300)}`,
            response.status
          );
        }
        // 其他非 2xx
        console.error(
          `[LLM] req=${reqId} error status=${response.status} type=upstream elapsed=${elapsed}ms body=${errText.slice(0, 200)}`
        );
        throw new LlmUpstreamError(
          `Upstream error: ${response.status} ${response.statusText} - ${errText.slice(0, 300)}`,
          response.status
        );
      }

      if (!response.body) {
        clearTimeout(timeout);
        throw new LlmNetworkError("LLM API returned no body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let chunkCount = 0;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") {
              clearTimeout(timeout);
              const elapsed = Date.now() - startedAt;
              console.log(
                `[LLM] req=${reqId} done chunks=${chunkCount} elapsed=${elapsed}ms${
                  usage ? ` tokens=${usage.total} (in=${usage.prompt} out=${usage.completion})` : ""
                }`
              );
              return;
            }
            try {
              const json = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
                usage?: {
                  prompt_tokens?: number;
                  completion_tokens?: number;
                  total_tokens?: number;
                };
              };
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                chunkCount++;
                yield { content, raw: json };
              }
              if (json.usage) {
                usage = {
                  prompt: json.usage.prompt_tokens ?? 0,
                  completion: json.usage.completion_tokens ?? 0,
                  total: json.usage.total_tokens ?? 0,
                };
              }
            } catch {
              // 忽略 SSE 单行解析失败
            }
          }
        }
        clearTimeout(timeout);
        const elapsed = Date.now() - startedAt;
        console.log(
          `[LLM] req=${reqId} done chunks=${chunkCount} elapsed=${elapsed}ms${
            usage ? ` tokens=${usage.total} (in=${usage.prompt} out=${usage.completion})` : ""
          }`
        );
      } finally {
        // 兜底：流结束后清理定时器
        clearTimeout(timeout);
      }
    } catch (err) {
      clearTimeout(timeout);
      if (!aborted) {
        const elapsed = Date.now() - startedAt;
        if (err instanceof LlmError) {
          // 错误已被上游 catch 处理并打日志
          throw err;
        }
        // 兜底：未知错误 → 网络错误
        const msg = err instanceof Error ? err.message : String(err);
        console.error(
          `[LLM] req=${reqId} error type=unknown elapsed=${elapsed}ms msg=${msg.slice(0, 200)}`
        );
        throw new LlmNetworkError(`Unknown error: ${msg}`);
      }
      throw err;
    }
  })();

  return {
    stream,
    usage: Promise.resolve(usage),
  };
}
