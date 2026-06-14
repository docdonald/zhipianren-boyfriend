// 设计预览版：带序章独白 + 立绘 + 场景背景的聊天页
// 绕过 Auth，仅供设计评审
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCharacter } from "@/lib/ai/characters";
import SceneBackground from "@/components/SceneBackground";
import OpeningMonologue from "@/components/OpeningMonologue";
import type { CharacterId } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { id?: string };
}

const SAMPLE_REPLIES: Record<CharacterId, string[]> = {
  "lin-xu-bai": [
    "……在。\n\n……你到了。",
    "……嗯。\n\n……今天风里有桂花的味道。\n\n……你闻到了吗。",
  ],
  "zhou-mu": [
    "坐。",
    "咖啡在桌角。\n\n……凉了。\n\n我没催你。\n\n但你迟到了 23 分钟。",
  ],
  "jiang-yu": [
    "在",
    "嗯\n\n说\n\n我听着\n\n你那段我先不接\n\n先回答我\n\n今天吃饭了吗",
  ],
  "xia-ye": [
    "嗨！小朋友！",
    "走走走！出去走走！\n\n楼下那家新开的小馆子你试了没！",
  ],
};

export default function PreviewChatPage({ searchParams }: PageProps) {
  const id = (searchParams.id ?? "lin-xu-bai") as CharacterId;
  const character = getCharacter(id);
  if (!character) notFound();

  const replies = SAMPLE_REPLIES[id];

  return (
    <main className="relative min-h-screen text-white">
      <SceneBackground scene={character.scene} />

      {/* 序章独白 */}
      <OpeningMonologue character={character} autoDismissMs={5000} />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 min-h-screen flex flex-col">
        {/* 顶部 */}
        <header className="flex items-center justify-between mb-6">
          <Link
            href={`/preview/memories?id=${id}`}
            className="text-white/60 hover:text-white text-sm font-serif-cn"
          >
            ← 档案
          </Link>
          <div className="text-center">
            <p className="text-white/90 text-sm font-serif-cn">
              {character.name}
            </p>
            <p className="text-white/50 text-[10px] tracking-widest">
              STAGE · 03 / DEPEND
            </p>
          </div>
          <Link
            href="/preview"
            className="text-white/60 hover:text-white text-sm font-serif-cn"
          >
            主页
          </Link>
        </header>

        {/* 阶段进度 */}
        <div className="h-0.5 w-full bg-white/10 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-white/70"
            style={{ width: `${(3 / 6) * 100}%` }}
          />
        </div>

        {/* 对话气泡 */}
        <div className="flex-1 space-y-6 mb-6">
          {replies.map((content, i) => (
            <div key={i} className="flex justify-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-base">
                {character.emoji}
              </div>
              <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-white/5 backdrop-blur border border-white/10 px-4 py-3">
                <p className="text-sm whitespace-pre-line break-words leading-loose font-serif-cn">
                  {content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 输入框（占位） */}
        <div className="flex gap-2 mb-4">
          <input
            disabled
            placeholder={`和 ${character.shortName} 说点什么…`}
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 text-sm"
          />
          <button
            disabled
            className="px-5 py-3 rounded-full bg-white/10 text-white/50 text-sm"
          >
            发送
          </button>
        </div>
        <p className="text-center text-white/30 text-[10px]">
          设计预览（实际未连接 API） ·{" "}
          <Link href={`/preview/memories?id=${id}`} className="underline">
            查看关系档案
          </Link>
        </p>
      </div>
    </main>
  );
}
