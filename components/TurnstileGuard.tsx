"use client";

import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match?.[2];
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Strict`;
}

export default function TurnstileGuard({
  siteKey,
  isLoggedIn,
}: {
  siteKey: string;
  isLoggedIn: boolean;
}) {
  const [verified, setVerified] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 已登录用户跳过验证
    if (isLoggedIn) {
      setVerified(true);
      return;
    }
    // 检查是否已有验证 Cookie
    if (getCookie("turnstile_verified") === "1") {
      setVerified(true);
    }
  }, [isLoggedIn]);

  const handleSuccess = () => {
    setCookie("turnstile_verified", "1", 7);
    setVerified(true);
  };

  // 避免服务端渲染闪烁
  if (!mounted) return null;
  if (verified) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h2 className="text-xl font-medium mb-2">验证一下</h2>
        <p className="text-white/50 text-sm mb-8">
          点击下方按钮完成验证，继续访问纸片人男友。
        </p>
        <div className="flex justify-center">
          <Turnstile siteKey={siteKey} onSuccess={handleSuccess} />
        </div>
        <p className="text-white/30 text-xs mt-6">
          验证通过后 7 天内无需再次验证。
        </p>
      </div>
    </div>
  );
}
