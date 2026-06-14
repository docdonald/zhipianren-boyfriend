// 4 角色共享类型
export type CharacterId = "lin-xu-bai" | "zhou-mu" | "jiang-yu" | "xia-ye";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  imageUrl?: string;
}

export interface ChatRequest {
  characterId: CharacterId;
  messages: ChatMessage[];
}

// =============================================================
// LLM 错误族（由 llm-client 抛出，service / route 捕获并转 HTTP）
// =============================================================

/** LLM 调用错误基类 */
export class LlmError extends Error {
  readonly type: string;
  readonly status: number;
  readonly upstreamStatus?: number;
  readonly retriable: boolean;

  constructor(
    type: string,
    message: string,
    status: number,
    options: { upstreamStatus?: number; retriable?: boolean } = {}
  ) {
    super(message);
    this.name = "LlmError";
    this.type = type;
    this.status = status;
    this.upstreamStatus = options.upstreamStatus;
    this.retriable = options.retriable ?? false;
  }
}

/** 401：API Key 无效或权限不足 */
export class LlmAuthError extends LlmError {
  constructor(message: string, upstreamStatus?: number) {
    super("auth", message, 401, { upstreamStatus, retriable: false });
    this.name = "LlmAuthError";
  }
}

/** 429：限流 */
export class LlmRateLimitError extends LlmError {
  constructor(message: string, upstreamStatus?: number) {
    super("rate_limit", message, 429, { upstreamStatus, retriable: true });
    this.name = "LlmRateLimitError";
  }
}

/** 504：请求超时（fetch 30s 内未收到任何数据） */
export class LlmTimeoutError extends LlmError {
  constructor(message: string) {
    super("timeout", message, 504, { retriable: true });
    this.name = "LlmTimeoutError";
  }
}

/** 502：网络错误（DNS、连接被拒、连接重置等） */
export class LlmNetworkError extends LlmError {
  constructor(message: string) {
    super("network", message, 502, { retriable: true });
    this.name = "LlmNetworkError";
  }
}

/** 500：上游其他错误（5xx 兜底） */
export class LlmUpstreamError extends LlmError {
  constructor(message: string, upstreamStatus?: number) {
    super("upstream", message, 502, { upstreamStatus, retriable: false });
    this.name = "LlmUpstreamError";
  }
}
