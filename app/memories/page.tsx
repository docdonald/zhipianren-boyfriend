import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { conversations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { CHARACTERS } from "@/lib/ai/characters";
import { type CharacterId } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface CharacterSummary {
  characterId: CharacterId;
  name: string;
  tagline: string;
  totalMessages: number;
  lastActive: Date | null;
  preview: { role: string; content: string }[];
}

export default async function MemoriesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/memories");
  }

  const userId = session.user.id;

  // 按角色分组查询对话记录
  const allMessages = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.createdAt));

  // 按角色分组并取最近几条
  const characterMap = new Map<string, CharacterSummary>();

  for (const msg of allMessages) {
    const cid = msg.characterId as CharacterId;
    if (!characterMap.has(cid)) {
      const meta = CHARACTERS.find((c) => c.id === cid);
      characterMap.set(cid, {
        characterId: cid,
        name: meta?.name ?? cid,
        tagline: meta?.tagline ?? "",
        totalMessages: 0,
        lastActive: msg.createdAt,
        preview: [],
      });
    }
    const summary = characterMap.get(cid)!;
    summary.totalMessages++;
    if (summary.preview.length < 2 && msg.role !== "system") {
      summary.preview.push({
        role: msg.role,
        content: msg.content.slice(0, 80),
      });
    }
    if (summary.lastActive && msg.createdAt > summary.lastActive) {
      summary.lastActive = msg.createdAt;
    }
  }

  // 按最后活跃时间排序
  const summaries = Array.from(characterMap.values()).sort(
    (a, b) =>
      (b.lastActive?.getTime() ?? 0) - (a.lastActive?.getTime() ?? 0)
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <Link
          href="/"
          className="text-white/40 hover:text-white text-sm mb-8 inline-block"
        >
          ← 返回首页
        </Link>

        <h1
          className="font-serif-cn text-3xl md:text-4xl mb-2"
          style={{ fontWeight: 300 }}
        >
          回忆录
        </h1>
        <p className="text-white/40 text-sm mb-10">
          你与他们的故事，都记在这里。
        </p>

        {summaries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg mb-3">还没有对话记录</p>
            <p className="text-white/20 text-sm mb-8">
              选一个角色，开始你的第一段故事。
            </p>
            <Link
              href="/#characters"
              className="inline-block px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
            >
              去选角色 →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {summaries.map((s) => (
              <Link
                key={s.characterId}
                href={`/characters/${s.characterId}/chat`}
                className="group block p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <Image
                      src={`/characters/${s.characterId}.png`}
                      alt={s.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-white text-base font-medium">
                        {s.name}
                      </h3>
                      <span className="text-white/30 text-xs">
                        {s.lastActive
                          ? formatTimeAgo(s.lastActive)
                          : ""}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mb-3">
                      {s.tagline} · {s.totalMessages} 轮对话
                    </p>
                    <div className="space-y-1.5">
                      {s.preview.map((p, i) => (
                        <p
                          key={i}
                          className="text-white/30 text-xs truncate"
                        >
                          <span className="text-white/50">
                            {p.role === "user" ? "你" : s.name}：
                          </span>
                          {p.content}
                          {p.content.length >= 80 ? "…" : ""}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-white/30 text-xs group-hover:text-white/60 transition-colors">
                    继续对话 →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
