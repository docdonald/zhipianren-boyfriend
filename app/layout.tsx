import type { Metadata } from "next";
import "./globals.css";
import CrispChat from "@/components/crisp-chat";
import MicrosoftClarity from "@/components/microsoft-clarity";

export const metadata: Metadata = {
  title: "纸片人男友 · 4 个平行世界的他",
  description: "情感陪伴型 AI 角色扮演。温柔刺客 / 失控秩序 / 资源守恒 / 逃避阳光。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
        <CrispChat />
        <MicrosoftClarity />
      </body>
    </html>
  );
}
