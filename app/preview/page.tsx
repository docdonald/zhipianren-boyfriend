// 设计预览 - V2 版
// 主页：4 角色立绘卡（用 SVG 立绘 + 角色色板） + 跳转到：详情 / 档案 / 聊天预览
// 绕过 Auth，可直接看完整 V2 设计
import Link from "next/link";
import { CHARACTERS } from "@/lib/ai/characters";
import CharacterPortrait from "@/components/CharacterPortrait";

export const dynamic = "force-dynamic";

export default function DesignPreviewPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] text-white">
      <header className="px-6 py-10 max-w-6xl mx-auto flex items-start justify-between">
        <div>
          <p
            className="text-white/40 text-xs tracking-[0.4em] uppercase mb-3"
            style={{ fontFamily: '"LXGW WenKai TC", serif' }}
          >
            V2 DESIGN PREVIEW
          </p>
          <h1
            className="font-serif-cn text-4xl md:text-5xl"
            style={{ fontWeight: 300 }}
          >
            纸片人男友
          </h1>
          <p className="text-white/60 mt-3 text-sm md:text-base">
            4 个平行世界的他 · 选一个开始对话
          </p>
        </div>
        <Link
          href="/start"
          className="text-white/60 hover:text-white text-xs px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all"
        >
          回到开场页
        </Link>
      </header>

      <section className="px-6 pb-12 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CHARACTERS.map((char) => (
            <PreviewCard key={char.id} character={char} />
          ))}
        </div>
      </section>

      <footer className="px-6 py-10 max-w-6xl mx-auto text-center text-white/40 text-xs">
        <p>
          V2 · DeepSeek · 流式对话 · 服务端记忆 · 6 阶段亲密度 · TTS · 邮件拉活
        </p>
        <p className="mt-2">
          4 角色人设 · NextAuth · Drizzle/libSQL · Vercel 部署
        </p>
        <p className="mt-4 text-white/30">
          全部页面 ·{" "}
          <Link href="/start" className="underline hover:text-white/60">
            /start
          </Link>
          {" · "}
          <Link
            href="/preview/memories?id=lin-xu-bai"
            className="underline hover:text-white/60"
          >
            /memories
          </Link>
          {" · "}
          <Link
            href="/preview/chat?id=zhou-mu"
            className="underline hover:text-white/60"
          >
            /chat
          </Link>
        </p>
      </footer>
    </main>
  );
}

function PreviewCard({
  character,
}: {
  character: (typeof CHARACTERS)[number];
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/30 hover:scale-[1.01]">
      {/* 角色色板背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: character.scene.gradient,
          opacity: 0.5,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative p-6 flex gap-5 items-start min-h-[260px]">
        {/* 立绘 */}
        <div className="flex-shrink-0">
          <CharacterPortrait character={character} size="md" />
        </div>

        {/* 文字 */}
        <div className="flex-1 min-w-0">
          <p className="text-2xl mb-1">{character.emoji}</p>
          <h2 className="text-2xl font-serif-cn font-semibold mb-1">
            {character.name}
          </h2>
          <p className="text-white/70 text-xs mb-3 tracking-wider">
            {character.tagline}
          </p>
          <p className="text-white/85 text-sm leading-relaxed mb-4 line-clamp-3 font-serif-cn">
            {character.description}
          </p>

          <div className="flex flex-wrap gap-2 text-[10px] text-white/50">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {character.age}岁
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
              {character.archetype}
            </span>
          </div>

          {/* 操作 */}
          <div className="flex gap-2 mt-4">
            <Link
              href={`/preview/memories?id=${character.id}`}
              className="text-[11px] px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              档案
            </Link>
            <Link
              href={`/preview/chat?id=${character.id}`}
              className="text-[11px] px-3 py-1.5 rounded-full bg-white text-black hover:bg-white/90 transition-colors"
            >
              对话 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
