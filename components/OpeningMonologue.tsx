// G6 - 序章独白组件
// 首次进入角色聊天页时显示一段仪式化独白，带打字机效果
// 设计原则：克制、留白、不过分打扰；3-4 秒后淡出或点击进入
"use client";

import { useEffect, useState } from "react";
import type { CharacterMeta } from "@/lib/ai/characters";

interface OpeningMonologueProps {
  character: CharacterMeta;
  onComplete?: () => void;
  autoDismissMs?: number; // 0 = 不自动消失
}

export default function OpeningMonologue({
  character,
  onComplete,
  autoDismissMs = 6000,
}: OpeningMonologueProps) {
  const [visible, setVisible] = useState(true);
  const [typed, setTyped] = useState("");

  // 打字机效果
  useEffect(() => {
    const text = character.prologue;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 60);
    return () => clearInterval(id);
  }, [character.prologue]);

  // 自动消失
  useEffect(() => {
    if (autoDismissMs <= 0) return;
    const id = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, autoDismissMs);
    return () => clearTimeout(id);
  }, [autoDismissMs, onComplete]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6 cursor-pointer"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
      onClick={() => {
        setVisible(false);
        onComplete?.();
      }}
    >
      <div className="max-w-xl w-full text-center animate-fade-in">
        <p
          className="text-white/40 text-xs md:text-sm tracking-[0.4em] uppercase mb-10"
          style={{ fontFamily: '"LXGW WenKai TC", serif' }}
        >
          {character.archetype}
        </p>

        <p
          className="font-serif-cn text-white/90 text-lg md:text-xl leading-loose whitespace-pre-line"
          style={{ fontWeight: 300, minHeight: "8rem" }}
        >
          {typed}
          <span className="inline-block w-0.5 h-5 bg-white/70 ml-0.5 align-middle animate-blink" />
        </p>

        <p className="mt-16 text-white/30 text-xs tracking-widest animate-pulse-soft">
          {autoDismissMs > 0 ? "点击任意处进入" : "点击进入"}
        </p>
      </div>
    </div>
  );
}
