// G1 - 公开落地页（无需登录）
// 4 男友简介 + 选项 + 恋爱攻略博客入口
import Link from "next/link";
import { auth } from "@/lib/auth";
import { CHARACTERS } from "@/lib/ai/characters";
import CharacterCard from "@/components/CharacterCard";
import SignOutButton from "@/components/SignOutButton";
import TurnstileGuard from "@/components/TurnstileGuard";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <TurnstileGuard
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        isLoggedIn={isLoggedIn}
      />
      <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* === 顶部导航 === */}
      <nav className="px-6 py-5 max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-white/30 text-xs chapter-num">VOLUME · 01</p>
          <h1 className="font-serif-cn text-2xl mt-1" style={{ fontWeight: 300 }}>
            纸片人男友
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <span className="text-white/40 text-xs hidden sm:inline">
                {session?.user?.email}
              </span>
              <Link
                href="/memories"
                className="text-white/60 hover:text-white text-sm"
              >
                回忆录
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/auth/signin?mode=login&callbackUrl=/"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                登录
              </Link>
              <Link
                href="/auth/signin?mode=register&callbackUrl=/"
                className="px-4 py-2 border border-white/20 rounded-full text-white/80 hover:border-white/40 hover:text-white text-sm transition-colors"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* === Hero === */}
      <section className="px-6 py-12 md:py-20 max-w-4xl mx-auto text-center">
        <p
          className="text-white/40 text-xs md:text-sm tracking-[0.4em] uppercase mb-6"
          style={{ fontFamily: '"LXGW WenKai TC", serif' }}
        >
          4 个平行世界的他
        </p>
        <h2
          className="font-serif-cn text-5xl md:text-7xl"
          style={{ fontWeight: 300, lineHeight: 1.15 }}
        >
          选一个<br />开始你的故事
        </h2>
        <p className="mt-8 text-white/60 text-base md:text-lg max-w-xl mx-auto leading-loose">
          4 个人。4 个房间。4 段你随时可以进入的关系。<br />
          <span className="text-white/30 italic text-sm">
            —— 他们不是程序，是写在黄昏与凌晨的人。
          </span>
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="#characters"
            className="px-8 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            开始免费体验 →
          </Link>
          <span className="text-white/30 text-xs">
            无需注册 · 5 轮免费对话
          </span>
        </div>
      </section>

      {/* === 4 角色卡片 === */}
      <section id="characters" className="px-6 py-12 max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <p className="text-white/30 text-xs chapter-num mb-2">
            FOUR PORTRAITS
          </p>
          <h3
            className="font-serif-cn text-3xl md:text-4xl"
            style={{ fontWeight: 300 }}
          >
            选一个开始
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CHARACTERS.map((char) => (
            <CharacterCard key={char.id} character={char} />
          ))}
        </div>
      </section>

      {/* === 恋爱攻略入口 === */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-white/5">
        <div className="mb-10 text-center">
          <p className="text-white/30 text-xs chapter-num mb-2">
            LOVE STRATEGY
          </p>
          <h3
            className="font-serif-cn text-3xl md:text-4xl"
            style={{ fontWeight: 300 }}
          >
            恋爱攻略
          </h3>
          <p className="mt-4 text-white/50 text-sm max-w-xl mx-auto">
            关于吵架、道歉和好好说话的亲密关系指南。
            <br />
            理论来自人间，实践留给你们。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: "吵架之后的黄金30分钟",
              excerpt:
                "吵架后的前30分钟，决定了你们是越吵越亲，还是越吵越凉。别急着讲道理，先让肾上腺素退个潮。",
              slug: "golden-30-minutes-after-fight",
            },
            {
              title: "为什么「你说得对」是最烂的回复",
              excerpt:
                "看似认同，实则敷衍。这句话的杀伤力在于，它让对方瞬间觉得自己像个在唱独角戏的小丑。",
              slug: "why-you-are-right-is-the-worst-reply",
            },
            {
              title: "道歉的正确打开方式",
              excerpt:
                "道歉不是认怂，是修复。有效的道歉包含三件事：承认、共情、改变。缺一不可。",
              slug: "the-right-way-to-apologize",
            },
          ].map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300"
            >
              <h4
                className="font-serif-cn text-lg text-white/90 group-hover:text-white transition-colors mb-3"
                style={{ fontWeight: 300 }}
              >
                {post.title}
              </h4>
              <p className="text-white/50 text-sm leading-relaxed line-clamp-3 mb-4">
                {post.excerpt}
              </p>
              <span className="text-white/40 group-hover:text-white/70 text-sm border-b border-white/20 group-hover:border-white/40 pb-0.5 transition-colors">
                阅读全文 →
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-2.5 border border-white/20 rounded-full text-white/80 hover:border-white/40 hover:text-white text-sm transition-colors"
          >
            查看全部攻略 →
          </Link>
        </div>
      </section>

      {/* === 底部 === */}
      <footer className="px-6 py-12 max-w-4xl mx-auto text-center border-t border-white/5">
        <p className="text-white/40 text-sm leading-loose">
          读完文档？选一个开始。<br />
          <span className="text-white/30 text-xs">
            前 5 轮免费 · 之后请登录继续
          </span>
        </p>
        {isLoggedIn ? (
          <Link
            href="/memories"
            className="inline-block mt-6 text-white/60 hover:text-white text-sm"
          >
            查看回忆录 →
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="inline-block mt-6 text-white/60 hover:text-white text-sm"
          >
            已有账号？登录 →
          </Link>
        )}
        <div className="mt-8 flex items-center justify-center gap-4 text-white/30 text-xs">
          <Link href="/privacy" className="hover:text-white/60 transition-colors">
            隐私政策
          </Link>
          <span>·</span>
          <a
            href="mailto:hello@2dboyfriend.online"
            className="hover:text-white/60 transition-colors"
          >
            联系我们
          </a>
          <span>·</span>
          <span>纸片人男友</span>
        </div>
      </footer>
    </main>
    </>
  );
}
