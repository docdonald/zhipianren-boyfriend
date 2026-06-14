// G2 - 角色详情页 / 人设卡
// 公开访问：未登录用户可查看人设 + 进入免费试用
// 含：立绘、人物档案、4 阶段行为、场景预览、开始对话按钮
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCharacter, CHARACTERS } from "@/lib/ai/characters";
import { TRANSITION_KEYS } from "@/lib/ai/intimacy";
import { STAGE_BEHAVIORS } from "@/lib/ai/stages";
import CharacterPortrait from "@/components/CharacterPortrait";
import SceneBackground from "@/components/SceneBackground";
import SignOutButton from "@/components/SignOutButton";
import type { CharacterId } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

const CHARACTER_ORDER: CharacterId[] = [
  "lin-xu-bai",
  "zhou-mu",
  "jiang-yu",
  "xia-ye",
];

export default async function CharacterDetailPage({ params }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const character = getCharacter(params.id);
  if (!character) notFound();

  const transitionKeys = TRANSITION_KEYS[character.id as CharacterId];
  const behaviors = STAGE_BEHAVIORS[character.id as CharacterId];
  const chapterIndex =
    CHARACTERS.findIndex((c) => c.id === character.id) + 1 || 1;

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <SceneBackground scene={character.scene} />

      {/* 顶部导航 */}
      <nav className="relative z-20 px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-white/70 hover:text-white text-sm flex items-center gap-2"
        >
          <span>←</span>
          <span className="font-serif-cn">回卷</span>
        </Link>
        <div className="text-white/40 text-xs chapter-num">
          CHAPTER · 0{chapterIndex} / 04
        </div>
        {isLoggedIn ? (
          <SignOutButton />
        ) : (
          <Link
            href={`/auth/signin?callbackUrl=/characters/${character.id}`}
            className="text-white/60 hover:text-white text-sm"
          >
            登录
          </Link>
        )}
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* === 左：立绘 === */}
          <div className="flex flex-col items-center">
            <div className="animate-fade-in-up">
              <CharacterPortrait
                character={character}
                size="xl"
                showFrame
                className="glow-lin filter drop-shadow-2xl"
              />
            </div>
            <p className="mt-6 text-white/30 text-xs text-center max-w-xs italic font-serif-cn">
              「{character.speechStyle}」
            </p>
          </div>

          {/* === 右：人物档案 === */}
          <div className="space-y-8">
            {/* 标题 */}
            <div>
              <p className="chapter-num text-white/40 text-xs mb-3">
                {character.archetype.toUpperCase()}
              </p>
              <h1
                className="font-serif-cn text-5xl md:text-6xl"
                style={{ fontWeight: 300, lineHeight: 1.1 }}
              >
                {character.name}
              </h1>
              <p className="mt-3 text-white/60 text-sm md:text-base">
                {character.tagline}
              </p>
            </div>

            {/* 描述 */}
            <p className="text-white/80 text-base leading-loose font-serif-cn first-letter-drop">
              {character.description}
            </p>

            {/* 档案字段 */}
            <div className="grid grid-cols-2 gap-6 py-6 border-y border-white/10">
              <Field label="年龄" value={`${character.age} 岁`} />
              <Field label="职业" value={character.occupation} />
              <Field label="所在" value={character.city} />
              <Field label="原型" value={character.archetype} />
            </div>

            {/* 场景 */}
            <div>
              <p className="chapter-num text-white/30 text-xs mb-2">SCENE</p>
              <p className="text-white/90 font-serif-cn text-lg">
                {character.scene.name}
              </p>
              <p className="text-white/50 text-sm italic mt-1 leading-relaxed">
                {character.scene.description}
              </p>
              <p className="text-white/30 text-xs mt-2 tracking-widest">
                {character.scene.mood}
              </p>
            </div>

            {/* 4 阶段行为时间线 */}
            <div>
              <p className="chapter-num text-white/30 text-xs mb-3">
                THE FOUR STAGES
              </p>
              <ol className="space-y-3">
                {behaviors.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 group">
                    <span className="chapter-num text-white/30 text-xs mt-1 w-8 flex-shrink-0">
                      {["I", "II", "III", "IV"][i]}
                    </span>
                    <span className="text-white/80 text-sm leading-relaxed">
                      {b}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* 跃迁钥匙 */}
            <div className="bg-white/5 backdrop-blur rounded-2xl p-5 border border-white/10">
              <p className="chapter-num text-white/40 text-xs mb-3">
                THE TRANSITION KEYS
              </p>
              <p className="text-white/60 text-xs mb-3 italic">
                满足任一时，他可能告白——
              </p>
              <ul className="space-y-2">
                {transitionKeys.map((k, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                    <span className="text-white/40 mt-0.5">·</span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 序章独白预览 */}
            <details className="group">
              <summary className="cursor-pointer text-white/50 text-sm hover:text-white/80 flex items-center gap-2">
                <span className="chapter-num text-xs">PROLOGUE</span>
                <span className="text-xs italic">展开序章独白</span>
              </summary>
              <pre className="mt-3 p-4 bg-black/40 rounded-lg text-white/80 text-sm whitespace-pre-wrap font-serif-cn leading-loose">
{character.prologue}
              </pre>
            </details>

            {/* 主操作 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href={`/characters/${character.id}/chat`}
                className="group flex-1 relative px-8 py-4 border border-white/30 rounded-full overflow-hidden transition-all duration-500 hover:border-white/60 text-center"
              >
                <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 text-sm tracking-widest text-white group-hover:text-black transition-colors duration-500 font-serif-cn">
                  {isLoggedIn ? "翻开对话 →" : "免费体验 10 轮 →"}
                </span>
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/memories"
                  className="px-6 py-4 border border-white/15 rounded-full text-white/60 hover:text-white hover:border-white/30 text-sm transition-colors text-center"
                >
                  回忆录
                </Link>
              ) : (
                <Link
                  href={`/auth/signin?callbackUrl=/characters/${character.id}/chat`}
                  className="px-6 py-4 border border-white/15 rounded-full text-white/60 hover:text-white hover:border-white/30 text-sm transition-colors text-center"
                >
                  登录继续
                </Link>
              )}
            </div>

            {!isLoggedIn && (
              <p className="text-white/30 text-xs text-center pt-1">
                无需注册 · 前 10 轮免费 · 登录后会记住你说过的话
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="chapter-num text-white/30 text-[10px] tracking-widest">
        {label.toUpperCase()}
      </p>
      <p className="text-white/90 text-sm mt-1 font-serif-cn">{value}</p>
    </div>
  );
}
