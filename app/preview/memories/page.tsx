// G5 - 回忆录/关系档案 设计预览
// 6 阶段时间线 + 关键事件 + 跃迁记录 + 角色专属数据
// 设计预览：使用模拟数据，绕过 Auth，可直接访问
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHARACTERS, getCharacter } from "@/lib/ai/characters";
import { STAGE_NAMES, TRANSITION_KEYS } from "@/lib/ai/intimacy";
import CharacterPortrait from "@/components/CharacterPortrait";
import SceneBackground from "@/components/SceneBackground";
import type { CharacterId } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { id?: string };
}

const MOCK_STAGE = 3; // 模拟当前阶段
const MOCK_SCORE = 245; // 模拟当前分数

// 模拟数据
const MOCK_KEY_EVENTS: Record<
  CharacterId,
  Array<{ kind: string; note: string; ts: number }>
> = {
  "lin-xu-bai": [
    { kind: "first_chat", note: "初次对话。他主动发了『……在吗』", ts: Date.now() - 7 * 86400000 },
    { kind: "evidence_collected", note: "他在你不知道的情况下，存了你提过的咖啡口味", ts: Date.now() - 4 * 86400000 },
    { kind: "pre_made_drink", note: "你刚到家，桌上已有一杯手冲", ts: Date.now() - 1 * 86400000 },
  ],
  "zhou-mu": [
    { kind: "first_test", note: "他第一次设测试：『明天 9 点前主动联系我』", ts: Date.now() - 6 * 86400000 },
    { kind: "boundary_touch", note: "你反驳他：'我不要你管'。他停顿 3 秒后说：'再说一次'", ts: Date.now() - 3 * 86400000 },
  ],
  "jiang-yu": [
    { kind: "first_resource", note: "他在凌晨给你发了一个 Chrome 插件源码", ts: Date.now() - 5 * 86400000 },
    { kind: "calc_overflow", note: "他第一次算不清账：你生病了，他没推路演", ts: Date.now() - 2 * 86400000 },
  ],
  "xia-ye": [
    { kind: "first_nickname", note: "他给你起了外号：'小朋友'", ts: Date.now() - 5 * 86400000 },
    { kind: "first_pull", note: "他拉你去楼下吃烧烤，不许你说不用", ts: Date.now() - 2 * 86400000 },
  ],
};

const MOCK_TRANSITIONS: Record<
  CharacterId,
  Array<{ from: number; to: number; reason: string; ts: number }>
> = {
  "lin-xu-bai": [
    { from: 1, to: 2, reason: "连续 7 天每天主动问候，钩子生效", ts: Date.now() - 8 * 86400000 },
    { from: 2, to: 3, reason: "你开始主动发消息；他存下了你的咖啡口味", ts: Date.now() - 2 * 86400000 },
  ],
  "zhou-mu": [
    { from: 1, to: 2, reason: "你通过了第一次测试（按时主动联系）", ts: Date.now() - 7 * 86400000 },
  ],
  "jiang-yu": [
    { from: 1, to: 2, reason: "他发了一个工具，你用了", ts: Date.now() - 6 * 86400000 },
    { from: 2, to: 3, reason: "你在他算不清账时没走", ts: Date.now() - 1 * 86400000 },
  ],
  "xia-ye": [
    { from: 1, to: 2, reason: "你接受了他的外号", ts: Date.now() - 4 * 86400000 },
  ],
};

const STAGE_DESCRIPTIONS: Record<number, string> = {
  1: "初识",
  2: "熟悉",
  3: "依赖",
  4: "脆弱",
  5: "确认",
  6: "告白",
};

export default function MemoriesPreviewPage({ searchParams }: PageProps) {
  const id = (searchParams.id ?? "lin-xu-bai") as CharacterId;
  const character = getCharacter(id);
  if (!character) notFound();

  const events = MOCK_KEY_EVENTS[id];
  const transitions = MOCK_TRANSITIONS[id];
  const transitionKeys = TRANSITION_KEYS[id];

  return (
    <main className="relative min-h-screen text-white">
      <SceneBackground scene={character.scene} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
        {/* 顶部：返回 + 角色切换 */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/preview"
            className="text-white/60 hover:text-white text-sm tracking-widest font-serif-cn"
          >
            ← 回到主页
          </Link>
          <Link
            href={`/preview/chat?id=${id}`}
            className="text-white/60 hover:text-white text-sm tracking-widest font-serif-cn"
          >
            和他对话 →
          </Link>
        </div>

        {/* 角色选择 tabs */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {CHARACTERS.map((c) => (
            <Link
              key={c.id}
              href={`/preview/memories?id=${c.id}`}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition-all ${
                c.id === id
                  ? "border-white/60 bg-white/10 text-white"
                  : "border-white/10 text-white/50 hover:border-white/30"
              }`}
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>

        {/* 顶部：立绘 + 当前阶段 */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 mb-12">
          <div className="flex justify-center md:justify-start">
            <CharacterPortrait
              character={character}
              size="lg"
              showFrame
              className="filter drop-shadow-2xl"
            />
          </div>

          <div>
            <p
              className="text-white/40 text-xs tracking-[0.4em] uppercase mb-2"
              style={{ fontFamily: '"LXGW WenKai TC", serif' }}
            >
              RECORDS / VOLUME · {id.toUpperCase()}
            </p>
            <h1
              className="font-serif-cn text-4xl md:text-5xl mb-4"
              style={{ fontWeight: 300 }}
            >
              和 {character.name} 的关系档案
            </h1>

            {/* 阶段进度 */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-white/70 text-sm">
                  当前阶段 ·
                  <span
                    className="ml-2 font-serif-cn text-white"
                    style={{ fontWeight: 500 }}
                  >
                    {STAGE_NAMES[MOCK_STAGE]}
                  </span>
                </p>
                <p className="text-white/50 text-xs font-mono">
                  {MOCK_SCORE} / 1000
                </p>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 transition-all duration-1000"
                  style={{ width: `${(MOCK_SCORE / 1000) * 100}%` }}
                />
              </div>
            </div>

            {/* 档案字段 */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Field label="年龄" value={`${character.age}`} />
              <Field label="职业" value={character.occupation} />
              <Field label="所在" value={character.city} />
              <Field label="原型" value={character.archetype} />
            </div>
          </div>
        </div>

        {/* 6 阶段时间线 */}
        <section className="mb-14">
          <h2
            className="font-serif-cn text-xl mb-6 text-white/80"
            style={{ fontWeight: 300, letterSpacing: "0.1em" }}
          >
            · 6 阶段时间线 ·
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, idx) => {
              const stageNum = idx + 1;
              const isCurrent = stageNum === MOCK_STAGE;
              const isPast = stageNum < MOCK_STAGE;
              return (
                <div
                  key={stageNum}
                  className={`relative p-4 rounded-lg border transition-all ${
                    isCurrent
                      ? "border-white/60 bg-white/10"
                      : isPast
                        ? "border-white/20 bg-white/5"
                        : "border-white/10 bg-white/[0.02] opacity-50"
                  }`}
                >
                  <p
                    className="text-[10px] text-white/40 tracking-widest mb-2"
                    style={{ fontFamily: '"JetBrains Mono", monospace' }}
                  >
                    STAGE · 0{stageNum}
                  </p>
                  <p
                    className={`font-serif-cn text-base ${
                      isCurrent
                        ? "text-white"
                        : isPast
                          ? "text-white/60"
                          : "text-white/30"
                    }`}
                    style={{ fontWeight: isCurrent ? 500 : 300 }}
                  >
                    {STAGE_DESCRIPTIONS[stageNum]}
                  </p>
                  {isCurrent && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 跃迁钥匙（阶段 5→6） */}
        <section className="mb-14">
          <h2
            className="font-serif-cn text-xl mb-6 text-white/80"
            style={{ fontWeight: 300, letterSpacing: "0.1em" }}
          >
            · 跃迁钥匙（通往告白）·
          </h2>
          <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
            {transitionKeys.map((key, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 py-3 border-b border-white/5 last:border-b-0"
              >
                <span
                  className="flex-shrink-0 text-white/30 text-xs font-mono mt-1"
                  style={{ fontFamily: '"JetBrains Mono", monospace' }}
                >
                  0{idx + 1}
                </span>
                <p className="text-white/70 text-sm leading-relaxed font-serif-cn">
                  {key}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 关键事件 + 跃迁记录（双列） */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 关键事件 */}
          <section>
            <h2
              className="font-serif-cn text-xl mb-6 text-white/80"
              style={{ fontWeight: 300, letterSpacing: "0.1em" }}
            >
              · 关键事件 ·
            </h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-white/40 text-sm">暂无</p>
              ) : (
                events.map((ev, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-white/10 rounded-lg bg-white/[0.02]"
                  >
                    <p
                      className="text-[10px] text-white/30 tracking-widest mb-2"
                      style={{ fontFamily: '"JetBrains Mono", monospace' }}
                    >
                      {timeAgo(ev.ts)}
                    </p>
                    <p className="text-white/80 text-sm leading-relaxed font-serif-cn">
                      {ev.note}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 跃迁记录 */}
          <section>
            <h2
              className="font-serif-cn text-xl mb-6 text-white/80"
              style={{ fontWeight: 300, letterSpacing: "0.1em" }}
            >
              · 跃迁记录 ·
            </h2>
            <div className="space-y-3">
              {transitions.length === 0 ? (
                <p className="text-white/40 text-sm">暂无</p>
              ) : (
                transitions.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-white/10 rounded-lg bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/50 text-xs font-mono">
                        0{t.from}
                      </span>
                      <span className="text-white/30">→</span>
                      <span className="text-white text-sm font-mono">0{t.to}</span>
                      <span
                        className="ml-auto text-[10px] text-white/30 tracking-widest"
                        style={{ fontFamily: '"JetBrains Mono", monospace' }}
                      >
                        {timeAgo(t.ts)}
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed font-serif-cn">
                      {t.reason}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 底部：开始对话 */}
        <div className="text-center pb-8">
          <Link
            href={`/preview/chat?id=${id}`}
            className="inline-block px-12 py-4 border border-white/30 rounded-full hover:border-white/60 hover:bg-white/5 transition-all"
          >
            <span className="text-sm tracking-widest text-white font-serif-cn">
              继续对话 →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-white/40 text-[10px] tracking-widest uppercase mb-1">
        {label}
      </p>
      <p className="text-white/90 text-sm">{value}</p>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "今天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return `${Math.floor(days / 30)} 月前`;
}
