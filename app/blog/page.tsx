import Link from "next/link";
import { getAllPosts } from "@/lib/blog/posts";

export const metadata = {
  title: "恋爱攻略 · 纸片人男友",
  description: "关于吵架、道歉和好好说话的亲密关系指南",
};

export default function BlogListPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 顶部导航 */}
      <nav className="px-6 py-5 max-w-4xl mx-auto flex items-center gap-4">
        <Link
          href="/"
          className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          返回首页
        </Link>
      </nav>

      {/* Hero */}
      <section className="px-6 py-12 max-w-4xl mx-auto text-center">
        <p className="text-white/30 text-xs tracking-[0.4em] uppercase mb-4">
          LOVE STRATEGY
        </p>
        <h1
          className="font-serif-cn text-4xl md:text-5xl"
          style={{ fontWeight: 300, lineHeight: 1.2 }}
        >
          恋爱攻略
        </h1>
        <p className="mt-6 text-white/50 text-base max-w-xl mx-auto leading-relaxed">
          关于吵架、道歉和好好说话的亲密关系指南。
          <br />
          <span className="text-white/30 italic text-sm">
            —— 理论来自人间，实践留给你们。
          </span>
        </p>
      </section>

      {/* 文章列表 */}
      <section className="px-6 py-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 md:p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white/30 text-xs chapter-num">
                  {post.publishedAt}
                </span>
                <span className="text-white/20">·</span>
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/5"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <h2
                className="font-serif-cn text-xl md:text-2xl text-white/90 group-hover:text-white transition-colors mb-3"
                style={{ fontWeight: 300 }}
              >
                {post.title}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center text-white/40 group-hover:text-white/70 text-sm transition-colors">
                <span className="border-b border-white/20 group-hover:border-white/40 pb-0.5">
                  阅读全文 →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 底部 */}
      <footer className="px-6 py-12 max-w-4xl mx-auto text-center border-t border-white/5">
        <Link
          href="/"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          ← 返回首页选个男友开始对话
        </Link>
      </footer>
    </main>
  );
}
