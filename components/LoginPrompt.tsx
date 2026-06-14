"use client";

// 登录提示弹层 - 试用耗尽后展示
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface LoginPromptProps {
  open: boolean;
  onDismiss?: () => void;
}

export default function LoginPrompt({ open, onDismiss }: LoginPromptProps) {
  const router = useRouter();
  const pathname = usePathname();

  if (!open) return null;

  const callbackUrl = encodeURIComponent(pathname || "/");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* 弹层本体 */}
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0f0f0f] p-8 text-center shadow-2xl">
        <p className="chapter-num text-white/30 text-[10px] mb-3">
          FREE TRIAL ENDED
        </p>
        <h2
          className="font-serif-cn text-2xl md:text-3xl mb-4"
          style={{ fontWeight: 300, lineHeight: 1.3 }}
        >
          这段对话<br />值得被记住
        </h2>
        <p className="text-white/60 text-sm leading-loose mb-8">
          你已经免费和他聊了 10 轮。<br />
          登录后，他会记得你说过的话。<br />
          <span className="text-white/30 text-xs">
            —— 包括他没说完的那些省略号。
          </span>
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/auth/signin?callbackUrl=${callbackUrl}`}
            className="block w-full px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
          >
            登录继续对话 →
          </Link>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="block w-full px-6 py-3 border border-white/15 text-white/70 rounded-full text-sm hover:border-white/30 hover:text-white transition-colors"
          >
            返回选一个别的
          </button>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="mt-6 text-white/30 hover:text-white/60 text-xs transition-colors"
          >
            先不
          </button>
        )}
      </div>
    </div>
  );
}
