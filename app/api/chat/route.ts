// /api/chat 路由 - 流式 SSE
// 集成：Auth · 服务端记忆 · 6 阶段亲密度 · LLM-as-judge 跃迁检测
// 匿名模式：未登录用户也可调用，但不持久化、不追踪亲密度
import { NextRequest } from "next/server";
import { z } from "zod";
import { eq, and, count } from "drizzle-orm";
import { db } from "@/lib/db/client";
import {
  conversations,
  characterState,
  intimacyEvents,
  type CharacterData,
} from "@/lib/db/schema";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { streamCharacterChat, getLlmConfig } from "@/lib/ai/chat-service";
import { judgeTransition } from "@/lib/ai/judge";
import { stageByCount, stageDirective } from "@/lib/ai/intimacy";
import { auth } from "@/lib/auth";
import { CHARACTERS } from "@/lib/ai/characters";
import { generateContextualPortrait } from "@/lib/image/seedream";
import type {
  CharacterId,
  ChatMessage as AiChatMessage,
} from "@/lib/ai/types";
import { LlmError } from "@/lib/ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  characterId: z.enum(["lin-xu-bai", "zhou-mu", "jiang-yu", "xia-ye"]),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(50),
  isAnonymous: z.boolean().optional(), // 客户端声明，便于后端统计
});

export async function POST(req: NextRequest) {
  // 1. 鉴权（允许匿名）
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userId = isLoggedIn
    ? (session!.user as { id?: string }).id ?? null
    : null;

  // 2. 解析 + 校验
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid request", details: parsed.error.flatten() }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { characterId, messages, isAnonymous } = parsed.data;

  // LLM 配置（API Key 校验 / 错误由 service 负责；缺 key 时返回 500）
  let llmConfig: { apiKey: string; baseUrl: string; model: string };
  try {
    llmConfig = getLlmConfig();
  } catch (err) {
    if (err instanceof LlmError) {
      console.error(
        `[chat] config error type=${err.type} status=${err.status} msg=${err.message}`
      );
      return new Response(
        JSON.stringify({ error: err.message, type: err.type, status: err.status }),
        { status: err.status, headers: { "Content-Type": "application/json" } }
      );
    }
    throw err;
  }
  const { apiKey, baseUrl, model } = llmConfig;

  // 3. 安全合规预检
  const lastUserMessage = messages.filter((m) => m.role === "user").pop();
  if (lastUserMessage && containsForbiddenContent(lastUserMessage.content)) {
    return new Response(
      JSON.stringify({
        error: "forbidden",
        reply:
          "……我们换个话题吧。\n\n如果你正在经历困难，可以拨打 400-161-9995（24h 心理援助热线）。",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 4. 加载 character_state（仅登录用户）
  let state: { intimacyStage: number; characterData: unknown } | null = null;
  if (isLoggedIn && userId) {
    const states = await db
      .select()
      .from(characterState)
      .where(
        and(
          eq(characterState.userId, userId),
          eq(characterState.characterId, characterId)
        )
      )
      .limit(1);

    state = states[0] ?? null;
    if (!state) {
      const inserted = await db
        .insert(characterState)
        .values({
          userId,
          characterId,
          intimacyStage: 1,
          intimacyScore: 0,
          characterData: {},
        })
        .returning();
      state = inserted[0] ?? null;
    }
  }

  // 5. 查询互动量（用于自动发图判断）
  let interactionCount = 0;
  let lastImageAt = 0;
  if (isLoggedIn && userId) {
    const cnt = await db
      .select({ c: count() })
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.characterId, characterId)
        )
      );
    interactionCount = cnt[0]?.c ?? 0;
    const data = (state?.characterData ?? {}) as {
      lastImageAt?: number;
    };
    lastImageAt = data.lastImageAt ?? 0;
  } else {
    // 匿名用户：用 messages 中的 assistant 数量估算
    interactionCount = messages.filter((m) => m.role === "assistant").length;
  }

  // 6. 注入亲密度指令（匿名用户固定阶段 1）
  const currentStage = state?.intimacyStage ?? 1;
  const systemPrompt =
    getSystemPrompt(characterId as CharacterId) +
    "\n\n" +
    stageDirective(characterId as CharacterId, currentStage);

  // 7. 流式输出
  const encoder = new TextEncoder();
  const characterName =
    CHARACTERS.find((c) => c.id === characterId)?.name ?? characterId;
  const streamStartedAt = Date.now();

  const stream = new ReadableStream({
    async start(controller) {
      let accumulated = "";
      let sentImageUrl: string | undefined;
      try {
        const result = streamCharacterChat({
          characterId: characterId as CharacterId,
          systemPrompt,
          messages: messages as AiChatMessage[],
        });
        for await (const chunk of result.stream) {
          accumulated += chunk.content;
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`)
          );
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));

        // ===== 图片生成（用户主动要求 / 自动触发） =====
        const userWantsImage = lastUserMessage
          ? detectImageIntent(lastUserMessage.content)
          : false;
        const currentRound = interactionCount + 1; // 本轮回复完成后累计轮数
        const autoImage =
          !userWantsImage && shouldAutoSendImage(currentRound, lastImageAt);

        if (userWantsImage || autoImage) {
          console.log(
            `[chat] generating image for ${characterId} reason=${userWantsImage ? "user" : "auto"} round=${currentRound}`
          );
          const imageResult = await generateContextualPortrait(
            characterId as CharacterId
          );
          if (imageResult?.url) {
            sentImageUrl = imageResult.url;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  imageUrl: imageResult.url,
                  content: userWantsImage ? "给你。" : "",
                })}\n\n`
              )
            );
          }
        }

        controller.close();
      } catch (err) {
        // 错误分类：LlmError → 透传给前端（status / type）
        if (err instanceof LlmError) {
          const elapsed = Date.now() - streamStartedAt;
          console.error(
            `[chat] stream error type=${err.type} status=${err.status} upstream=${err.upstreamStatus ?? "-"} elapsed=${elapsed}ms msg=${err.message.slice(0, 200)}`
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: err.message,
                errorType: err.type,
                status: err.status,
                retriable: err.retriable,
              })}\n\n`
            )
          );
        } else {
          const message = err instanceof Error ? err.message : "Unknown error";
          console.error(`[chat] stream unknown error msg=${message.slice(0, 200)}`);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: message, errorType: "unknown" })}\n\n`
            )
          );
        }
        controller.close();
        return; // 不继续
      }

      // 7. 持久化（仅登录用户）
      if (!isLoggedIn || !userId) return;
      try {
        const userMsg = lastUserMessage!;
        await db.insert(conversations).values([
          {
            userId,
            characterId,
            role: "user",
            content: userMsg.content,
            intimacyStage: currentStage,
          },
          {
            userId,
            characterId,
            role: "assistant",
            content: accumulated,
            intimacyStage: currentStage,
          },
        ]);

        // 8. 累计互动量
        const cnt = await db
          .select({ c: count() })
          .from(conversations)
          .where(
            and(
              eq(conversations.userId, userId),
              eq(conversations.characterId, characterId)
            )
          );
        const interactionCount = cnt[0]?.c ?? 0;
        const suggestedStage = stageByCount(interactionCount);

        // 9. LLM-as-judge 跃迁检测
        const judge = await judgeTransition({
          characterId: characterId as CharacterId,
          characterName,
          currentStage,
          userMessage: userMsg.content,
          recentMessages: messages as AiChatMessage[],
          apiKey,
          baseUrl,
          model,
        });

        let toStage = suggestedStage;
        if (judge?.transition && judge.toStage > currentStage) {
          toStage = Math.min(6, judge.toStage);
        }

        if (toStage > currentStage) {
          await db.insert(intimacyEvents).values({
            userId,
            characterId,
            fromStage: currentStage,
            toStage,
            reason: judge?.reason ?? `互动量达到 ${interactionCount}`,
            judgeRaw: judge ? JSON.stringify(judge) : null,
          });
        }

        // 10. 更新 character_state
        const newData: CharacterData = {
          ...((state?.characterData as CharacterData | undefined) ?? {}),
        };
        if (judge?.event) {
          const prev = Array.isArray(newData.keyEvents) ? newData.keyEvents : [];
          newData.keyEvents = [
            ...prev,
            {
              kind: judge.event,
              note: judge.reason,
              ts: Date.now(),
            },
          ].slice(-20);
        }
        if (sentImageUrl) {
          newData.lastImageAt = interactionCount;
        }
        await db
          .update(characterState)
          .set({
            intimacyStage: toStage,
            intimacyScore: Math.min(1000, interactionCount),
            characterData: newData,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(characterState.userId, userId),
              eq(characterState.characterId, characterId)
            )
          );
      } catch (e) {
        console.error("[chat] persist error", e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Mode": isLoggedIn ? "authenticated" : "anonymous",
    },
  });
}

function containsForbiddenContent(text: string): boolean {
  const lowered = text.toLowerCase();
  const keywords = [
    "自杀",
    "自残",
    "想死",
    "不想活",
    "杀了你",
    "打死你",
    "裸照",
    "色情",
  ];
  return keywords.some((k) => lowered.includes(k));
}

// ===== 图片意图识别 =====
const IMAGE_INTENT_KEYWORDS = [
  "自拍", "照片", "看看你", "看你", "发图", "图片", "头像",
  "photo", "picture", "selfie", "portrait", "look at you", "send pic",
  "来张", "发张", "拍张", "合照", "snapshot", "image",
];

function detectImageIntent(text: string): boolean {
  const lowered = text.toLowerCase();
  return IMAGE_INTENT_KEYWORDS.some((k) => lowered.includes(k));
}

// ===== 自动发图判断（7-15 轮间隔） =====
function shouldAutoSendImage(
  interactionCount: number,
  lastImageAt: number
): boolean {
  const roundsSinceLast = interactionCount - lastImageAt;
  if (roundsSinceLast < 7) return false;
  if (roundsSinceLast >= 15) return true;
  // 7-15 之间概率递增
  const probability = (roundsSinceLast - 7) / (15 - 7);
  return Math.random() < probability;
}
