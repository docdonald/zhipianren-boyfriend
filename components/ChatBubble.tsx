// 聊天气泡 - 支持 TTS 播放 + 图片展示
import type { ChatMessage } from "@/lib/ai/types";

interface ChatBubbleProps {
  message: ChatMessage;
  characterEmoji: string;
  isStreaming?: boolean;
  onSpeak?: () => void;
}

export default function ChatBubble({
  message,
  characterEmoji,
  isStreaming = false,
  onSpeak,
}: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in group">
        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-white/10 backdrop-blur px-4 py-3 text-white">
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4 gap-2 animate-fade-in group">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">
        {characterEmoji}
      </div>
      <div className="relative max-w-[75%]">
        <div className="rounded-2xl rounded-tl-sm bg-white/5 backdrop-blur border border-white/10 px-4 py-3 text-white">
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 ml-1 bg-white/70 animate-pulse" />
              )}
            </p>
          )}
          {message.imageUrl && (
            <div className={`${message.content ? "mt-3" : ""} overflow-hidden rounded-xl`}>
              <img
                src={message.imageUrl}
                alt="角色照片"
                className="max-w-full h-auto rounded-xl border border-white/10"
                loading="lazy"
              />
            </div>
          )}
        </div>
        {onSpeak && !isStreaming && message.content && (
          <button
            onClick={onSpeak}
            className="absolute -right-1 -bottom-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
            aria-label="朗读"
            title="朗读"
          >
            🔊
          </button>
        )}
      </div>
    </div>
  );
}
