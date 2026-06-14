// LLM-as-judge：让另一个 LLM 调用判断是否触发跃迁/关键事件
// 输入：最近 10 轮对话、当前阶段、角色
// 输出：JSON { transition: bool, reason: string, score: 0-100, event: string|null }

import type { CharacterId } from "@/lib/ai/types";
import type { ChatMessage } from "@/lib/ai/types";
import { TRANSITION_KEYS, stageDirective } from "./intimacy";

const JUDGE_PROMPT = `你是「关系跃迁检测器」。判断最新对话是否触发了角色的跃迁钥匙或关键事件。

## 角色
{characterName}（{characterId}）

## 当前阶段
{currentStage}

## 阶段说明
{stageDirective}

## 该角色的跃迁钥匙
{transitionKeys}

## 用户最新输入
{userMessage}

## 最近 3 轮对话
{recentContext}

## 你的任务

只输出合法 JSON，不要任何多余文本：
{
  "transition": true | false,
  "toStage": 1-6,
  "reason": "一句话中文原因",
  "event": "事件名（如：'vulnerability_exposed' / 'boundary_crossed' / 'resource_rejected' / 'silence_respected'）" | null,
  "score": 0-100
}

判定原则：
- 阶段 1-3: 几乎不跃迁
- 阶段 3-4: 检测到用户主动暴露脆弱（说"我最近不太好"）→ 跃迁
- 阶段 4-5: 满足上面跃迁钥匙之一 → 跃迁
- 阶段 5-6: 必须满足该角色告白触发方式 → 跃迁
- score 反映你对此判定的把握度
- 若不确定，transition=false`;

export interface JudgeResult {
  transition: boolean;
  toStage: number;
  reason: string;
  event: string | null;
  score: number;
}

export async function judgeTransition(args: {
  characterId: CharacterId;
  characterName: string;
  currentStage: number;
  userMessage: string;
  recentMessages: ChatMessage[];
  apiKey: string;
  baseUrl: string;
  model: string;
}): Promise<JudgeResult | null> {
  const {
    characterId,
    characterName,
    currentStage,
    userMessage,
    recentMessages,
    apiKey,
    baseUrl,
    model,
  } = args;

  const recentContext = recentMessages
    .slice(-3)
    .map((m) => `${m.role === "user" ? "用户" : characterName}: ${m.content}`)
    .join("\n");

  const prompt = JUDGE_PROMPT.replace("{characterName}", characterName)
    .replace("{characterId}", characterId)
    .replace("{currentStage}", String(currentStage))
    .replace("{stageDirective}", stageDirective(characterId, currentStage))
    .replace("{transitionKeys}", TRANSITION_KEYS[characterId].join("\n- "))
    .replace("{userMessage}", userMessage)
    .replace("{recentContext}", recentContext || "（无）");

  try {
    const resp = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: prompt },
          { role: "user", content: "请输出 JSON。" },
        ],
        temperature: 0.2,
        max_tokens: 200,
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) return null;
    const json = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    return JSON.parse(content) as JudgeResult;
  } catch {
    return null;
  }
}
