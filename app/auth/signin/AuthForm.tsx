"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

export default function AuthForm({
  action,
  isRegister,
  siteKey,
  callbackUrl,
}: {
  action: (formData: FormData) => void;
  isRegister: boolean;
  siteKey: string;
  callbackUrl: string;
}) {
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileError, setTurnstileError] = useState(false);

  // 注册时若 Turnstile 正常加载且未通过验证，则禁用按钮；
  // 若 Turnstile 加载失败（如 siteKey 无效），则不再阻塞注册。
  const submitDisabled = isRegister && !turnstileToken && !turnstileError;

  return (
    <form
      action={action}
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <h2 className="text-lg font-semibold mb-1">
        {isRegister ? "注册账号" : "用邮箱登录"}
      </h2>
      <p className="text-white/50 text-xs mb-5">
        {isRegister
          ? "新用户注册，输入邮箱和密码即可。"
          : "老用户输入邮箱和密码直接登录。"}
      </p>
      <input
        name="email"
        type="email"
        required
        placeholder="your@email.com"
        className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 mb-3"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="密码"
        className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 mb-3"
      />
      {isRegister && (
        <>
          <input
            name="confirmPassword"
            type="password"
            required
            placeholder="确认密码"
            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 mb-3"
          />
          <input
            type="hidden"
            name="turnstileToken"
            value={turnstileToken}
          />
          <div className="mb-3 flex justify-center min-h-[70px]">
            <Turnstile
              siteKey={siteKey}
              onSuccess={(token) => {
                setTurnstileToken(token);
                setTurnstileError(false);
              }}
              onError={() => setTurnstileError(true)}
            />
          </div>
          {turnstileError && (
            <p className="text-red-400 text-xs text-center mb-3">
              人机验证加载失败，请刷新页面重试。若持续失败，可继续提交，后台将记录并人工审核。
            </p>
          )}
        </>
      )}
      <button
        type="submit"
        disabled={submitDisabled}
        className="w-full px-6 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isRegister ? "注册" : "登录"}
      </button>

      <div className="mt-4 text-center">
        {isRegister ? (
          <a
            href={`/auth/signin?mode=login&callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`}
            className="text-white/40 hover:text-white/70 text-xs"
          >
            已有账号？直接登录 →
          </a>
        ) : (
          <a
            href={`/auth/signin?mode=register&callbackUrl=${encodeURIComponent(
              callbackUrl
            )}`}
            className="text-white/40 hover:text-white/70 text-xs"
          >
            还没有账号？立即注册 →
          </a>
        )}
      </div>
    </form>
  );
}
