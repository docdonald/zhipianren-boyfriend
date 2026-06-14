"use client";

// 聊天输入框
import { useState, type FormEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled,
  placeholder = "说点什么…",
}: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 bg-black/20 backdrop-blur p-4"
    >
      <div className="flex gap-2 max-w-3xl mx-auto">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={2000}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="px-6 py-3 rounded-full bg-white text-black font-medium text-sm transition-all hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          发送
        </button>
      </div>
    </form>
  );
}
