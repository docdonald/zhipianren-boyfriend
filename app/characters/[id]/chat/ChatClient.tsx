"use client";

// 聊天客户端 - 支持登录 / 匿名双模式
// 登录：服务端记忆 + 亲密度条 + TTS
// 匿名：localStorage 记忆 + 10 轮免费试用 + 登录提示
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { CharacterMeta } from "@/lib/ai/characters";
import type { ChatMessage, CharacterId } from "@/lib/ai/types";
import ChatBubble from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import IntimacyBar from "@/components/IntimacyBar";
import LoginPrompt from "@/components/LoginPrompt";
import {
  FREE_TRIAL_LIMIT,
  getTrialCount,
  incrementTrial,
  remainingTrial,
} from "@/lib/trial";

const STAGE_NAMES: Record<number, string> = {
  1: "初识",
  2: "熟悉",
  3: "依赖",
  4: "脆弱",
  5: "确认",
  6: "告白",
};

interface ChatClientProps {
  character: CharacterMeta;
  isLoggedIn: boolean;
  userId: string | null;
  initialMessages: ChatMessage[];
  initialStage: number;
}

const ANON_STORAGE_KEY_PREFIX = "pb.chat."; // pb.chat.<characterId>

function readAnonHistory(characterId: string): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ANON_STORAGE_KEY_PREFIX + characterId);
    if (!raw) return [];
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

function writeAnonHistory(characterId: string, messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      ANON_STORAGE_KEY_PREFIX + characterId,
      JSON.stringify(messages)
    );
  } catch {
    // 忽略
  }
}

function clearAnonHistory(characterId: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ANON_STORAGE_KEY_PREFIX + characterId);
  } catch {
    // 忽略
  }
}

export default function ChatClient({
  character,
  isLoggedIn,
  userId,
  initialMessages,
  initialStage,
}: ChatClientProps) {
  // 登录用户用服务端初始历史；匿名用户从 localStorage 读
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (isLoggedIn) {
      if (initialMessages.length > 0) return initialMessages;
      return [
        { role: "assistant", content: getGreeting(character.id as CharacterId) },
      ];
    }
    const anon = readAnonHistory(character.id);
    if (anon.length > 0) return anon;
    return [
      { role: "assistant", content: getGreeting(character.id as CharacterId) },
    ];
  });

  const [stage, setStage] = useState<number>(initialStage);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const [trialCount, setTrialCount] = useState<number>(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 初始化：匿名用户读 localStorage 试用计数 + 尝试迁移历史
  useEffect(() => {
    if (!isLoggedIn) {
      setTrialCount(getTrialCount(character.id));
    } else {
      // 登录用户：如果本地有匿名历史，尝试迁移
      const anon = readAnonHistory(character.id);
      if (anon.length > 0) {
        void claimAnonymousHistory(character.id, anon);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 匿名用户：把消息存到 localStorage
  useEffect(() => {
    if (!isLoggedIn && messages.length > 0) {
      writeAnonHistory(character.id, messages);
    }
  }, [isLoggedIn, character.id, messages]);

  const handleSend = useCallback(
    async (text: string) => {
      if (isStreaming) return;
      setError(null);

      // 试用耗尽检查（仅匿名）
      if (!isLoggedIn) {
        const remaining = remainingTrial(character.id);
        if (remaining <= 0) {
          setShowLoginPrompt(true);
          return;
        }
      }

      const newMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: text },
      ];
      setMessages(newMessages);
      setIsStreaming(true);

      const assistantIndex = newMessages.length;
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId: character.id,
            messages: newMessages.slice(-20),
            isAnonymous: !isLoggedIn,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || `HTTP ${response.status}`);
        }
        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data) as {
                content?: string;
                imageUrl?: string;
                error?: string;
              };
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.content) {
                accumulated += parsed.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[assistantIndex] = {
                    role: "assistant",
                    content: accumulated,
                  };
                  return updated;
                });
              }
              if (parsed.imageUrl) {
                setMessages((prev) => [
                  ...prev,
                  {
                    role: "assistant",
                    content: parsed.content ?? "",
                    imageUrl: parsed.imageUrl,
                  },
                ]);
              }
            } catch (e) {
              if (
                e instanceof Error &&
                e.message !== "Unexpected end of JSON input"
              ) {
                throw e;
              }
            }
          }
        }

        // 试用计数 +1（仅匿名）
        if (!isLoggedIn) {
          const next = incrementTrial(character.id);
          setTrialCount(next);
          // 第 10 轮回应后弹出登录提示
          if (next >= FREE_TRIAL_LIMIT) {
            // 延迟一点弹出，让用户看到第 10 轮回复
            setTimeout(() => setShowLoginPrompt(true), 1500);
          }
        } else {
          // 登录：拉取最新 stage
          try {
            const r = await fetch(`/api/state?characterId=${character.id}`);
            if (r.ok) {
              const j = (await r.json()) as { stage: number };
              setStage(j.stage);
            }
          } catch {
            // 忽略
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        setMessages((prev) => {
          const updated = [...prev];
          updated[assistantIndex] = {
            role: "assistant",
            content: `（连接出了点问题：${message}）`,
          };
          return updated;
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [character.id, isLoggedIn, isStreaming, messages]
  );

  // TTS 播放（仅登录用户启用，避免匿名 TTS 滥用）
  const handleSpeak = useCallback(
    async (text: string) => {
      if (!isLoggedIn) {
        setTtsError("登录后即可收听他的声音");
        setTimeout(() => setTtsError(null), 2000);
        return;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setTtsError(null);
      try {
        const resp = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ characterId: character.id, text }),
        });
        if (!resp.ok) {
          const j = (await resp.json().catch(() => ({}))) as {
            error?: string;
            message?: string;
          };
          setTtsError(j.message ?? j.error ?? "TTS 不可用");
          return;
        }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
      } catch (e) {
        setTtsError(e instanceof Error ? e.message : "TTS 失败");
      }
    },
    [character.id, isLoggedIn]
  );

  const remaining = !isLoggedIn ? Math.max(0, FREE_TRIAL_LIMIT - trialCount) : null;
  const trialExhausted = !isLoggedIn && trialCount >= FREE_TRIAL_LIMIT;

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a]">
      {/* 顶部 */}
      <header
        className={`flex-shrink-0 border-b border-white/10 bg-gradient-to-r ${character.bgGradient} bg-opacity-20 backdrop-blur`}
      >
        <div className="px-4 py-3 flex items-center gap-3 max-w-3xl mx-auto">
          <Link
            href="/"
            className="text-white/70 hover:text-white text-sm flex-shrink-0"
          >
            ←
          </Link>
          <div className="text-2xl">{character.emoji}</div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold truncate">
              {character.name}
            </h1>
            <p className="text-white/60 text-xs truncate">{character.tagline}</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 pb-3">
          {isLoggedIn ? (
            <>
              <IntimacyBar stage={stage} maxStage={6} />
              <p className="text-white/50 text-[10px] mt-1">
                阶段 {stage}/6 · {STAGE_NAMES[stage]}
              </p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/60 transition-all duration-500"
                    style={{
                      width: `${((FREE_TRIAL_LIMIT - (remaining ?? 0)) / FREE_TRIAL_LIMIT) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-white/50 text-[10px] flex-shrink-0">
                  试用 {remaining}/{FREE_TRIAL_LIMIT}
                </span>
              </div>
              <p className="text-white/40 text-[10px] mt-1">
                {remaining! > 0
                  ? `免费对话还剩 ${remaining} 轮 · 登录可继续`
                  : "本轮免费对话已用完"}
              </p>
            </>
          )}
        </div>
      </header>

      {/* 消息流 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, i) => (
            <ChatBubble
              key={i}
              message={msg}
              characterEmoji={character.emoji}
              isStreaming={isStreaming && i === messages.length - 1}
              onSpeak={
                msg.role === "assistant" && !isStreaming
                  ? () => handleSpeak(msg.content)
                  : undefined
              }
            />
          ))}
          {error && (
            <div className="text-center text-red-400/80 text-xs py-2">
              {error}
            </div>
          )}
          {ttsError && (
            <div className="text-center text-amber-400/80 text-xs py-1">
              🔇 {ttsError}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区：试用耗尽时锁定 */}
      {trialExhausted ? (
        <div className="flex-shrink-0 border-t border-white/10 bg-black/40 px-4 py-5">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-white/70 text-sm mb-3">
              免费对话已用完 · 登录继续
            </p>
            <Link
              href={`/auth/signin?callbackUrl=/characters/${character.id}/chat`}
              className="inline-block px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
            >
              登录继续 →
            </Link>
          </div>
        </div>
      ) : (
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming}
          placeholder={`和 ${character.shortName} 说点什么…`}
        />
      )}

      {/* 登录提示弹层 */}
      <LoginPrompt
        open={showLoginPrompt}
        onDismiss={() => setShowLoginPrompt(false)}
      />
    </div>
  );
}

/**
 * 登录后：把匿名历史迁移到服务端
 */
async function claimAnonymousHistory(
  characterId: string,
  history: ChatMessage[]
) {
  try {
    const resp = await fetch("/api/chat/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characterId, messages: history }),
    });
    if (resp.ok) {
      clearAnonHistory(characterId);
    }
  } catch {
    // 静默失败，下次进入还会再试
  }
}

function getGreeting(id: CharacterId): string {
  switch (id) {
    case "lin-xu-bai":
      return "……你好。我是林叙白。\n\n……你是？";
    case "zhou-mu":
      return "你好。\n\n周牧野。坐。";
    case "jiang-yu":
      return "在\n\n江屿\n\n你是谁";
    case "xia-ye":
      return "嗨！小朋友！\n\n我是夏野！\n\n你今天吃饭了吗！";
  }
}
