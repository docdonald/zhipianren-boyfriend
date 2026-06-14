import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/blog/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} · 恋爱攻略`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return notFound();

  // 将内容按段落拆分渲染
  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* 顶部导航 */}
      <nav className="px-6 py-5 max-w-3xl mx-auto flex items-center justify-between">
        <Link
          href="/blog"
          className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          攻略列表
        </Link>
        <Link
          href="/"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          首页
        </Link>
      </nav>

      {/* 文章头部 */}
      <article className="px-6 py-8 max-w-3xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-white/30 text-xs flex-wrap">
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {post.publishedAt}
            </span>
            <span>·</span>
            <div className="flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              {post.tags.map((tag, i) => (
                <span key={tag}>{tag}{i < post.tags.length - 1 ? "、" : ""}</span>
              ))}
            </div>
          </div>
          <h1
            className="font-serif-cn text-3xl md:text-4xl text-white/90"
            style={{ fontWeight: 300, lineHeight: 1.3 }}
          >
            {post.title}
          </h1>
          <p className="mt-4 text-white/50 text-base leading-relaxed">
            {post.excerpt}
          </p>
        </header>

        {/* 正文 */}
        <div className="prose prose-invert prose-lg max-w-none">
          {paragraphs.map((para, idx) => {
            // 检测小标题（以"第一"、"第二"、"第"开头，或不以标点结尾的短句）
            const isHeading =
              /^第[一二三四五六七八九十]+/.test(para) ||
              (/^[^\n]{2,20}$/.test(para) &&
                !/[。！？.?!]$/.test(para) &&
                idx > 0);

            if (isHeading) {
              return (
                <h3
                  key={idx}
                  className="text-white/80 text-lg font-medium mt-8 mb-3"
                >
                  {para}
                </h3>
              );
            }

            return (
              <p
                key={idx}
                className="text-white/70 text-base leading-loose mb-5"
              >
                {para}
              </p>
            );
          })}
        </div>

        {/* 文章底部 */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              返回攻略列表
            </Link>
            <Link
              href="/"
              className="text-white/40 hover:text-white text-sm transition-colors"
            >
              去首页选个男友 →
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
