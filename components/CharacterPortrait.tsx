// G3 - 角色立绘组件
// 优先显示已生成图片 /characters/{id}.png，加载失败则展示 SVG 抽象人像

"use client";

import { useState } from "react";
import type { CharacterMeta } from "@/lib/ai/characters";
import { PortraitSVG } from "./PortraitSVG";

interface CharacterPortraitProps {
  character: CharacterMeta;
  size?: "sm" | "md" | "lg" | "xl";
  showFrame?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-48 h-48 md:w-64 md:h-64",
  xl: "w-72 h-96 md:w-96 md:h-[28rem]",
};

export default function CharacterPortrait({
  character,
  size = "md",
  showFrame = false,
  className = "",
}: CharacterPortraitProps) {
  const [imgError, setImgError] = useState(false);
  const imageUrl = `/characters/${character.id}.png`;

  return (
    <div
      className={`relative ${SIZE_CLASSES[size]} ${className} ${
        showFrame ? "corner-frame" : ""
      }`}
    >
      {/* 真实立绘（优先） */}
      {!imgError && (
        <img
          src={imageUrl}
          alt={character.name}
          className="w-full h-full object-cover rounded-2xl"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}

      {/* SVG 抽象立绘（兜底） */}
      {imgError && (
        <PortraitSVG
          character={character}
          className="w-full h-full rounded-2xl overflow-hidden"
        />
      )}
    </div>
  );
}
