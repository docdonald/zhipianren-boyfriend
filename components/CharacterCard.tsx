// 角色卡片（选角页用）
"use client";

import Link from "next/link";
import { useState } from "react";
import type { CharacterMeta } from "@/lib/ai/characters";

interface CharacterCardProps {
  character: CharacterMeta;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = `/characters/${character.id}.png`;

  return (
    <Link
      href={`/characters/${character.id}/chat`}
      className="group block relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/30 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* 渐变背景 */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${character.bgGradient} opacity-90 transition-opacity group-hover:opacity-100`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* 内容 */}
      <div className="relative p-6 h-full min-h-[280px] flex flex-col justify-between text-white">
        <div>
          {/* 角色头像（优先显示真实图片，失败回退 emoji） */}
          {!imgError ? (
            <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-2 border-white/20 shadow-lg">
              <img
                src={imageUrl}
                alt={character.name}
                className="w-full h-full object-cover object-top"
                onError={() => setImgError(true)}
                loading="lazy"
              />
            </div>
          ) : (
            <div className="text-5xl mb-4">{character.emoji}</div>
          )}
          <h2 className="text-2xl font-bold mb-1">{character.name}</h2>
          <p className="text-sm text-white/80 mb-3">{character.tagline}</p>
        </div>

        <div>
          <p className="text-sm text-white/90 leading-relaxed mb-4 line-clamp-3">
            {character.description}
          </p>
          <div className="inline-flex items-center text-sm font-mono px-3 py-1 rounded-full bg-black/30 backdrop-blur">
            <span className="opacity-80">「{character.speechStyle}」</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
