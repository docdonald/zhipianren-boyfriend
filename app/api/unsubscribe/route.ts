// 退订端点
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { emailUnsubscribes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "missing token" }, { status: 400 });
  }

  const rows = await db
    .select()
    .from(emailUnsubscribes)
    .where(eq(emailUnsubscribes.token, token))
    .limit(1);

  if (!rows[0]) {
    return new Response("无效的退订链接", { status: 404 });
  }

  // 同时关闭 user.emailOptIn（如果关联）
  await db
    .update(users)
    .set({ emailOptIn: false })
    .where(eq(users.email, rows[0].email));

  return new Response(
    `<!doctype html>
    <html lang="zh-CN">
    <head>
      <meta charset="utf-8">
      <title>已退订</title>
      <style>
        body { font-family: -apple-system, "PingFang SC", sans-serif; background: #0a0a0a; color: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 40px; max-width: 420px; text-align: center; }
        h1 { margin: 0 0 12px; font-size: 22px; }
        p { color: rgba(255,255,255,0.6); line-height: 1.6; margin: 0; }
        a { color: white; display: inline-block; margin-top: 24px; padding: 10px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 999px; text-decoration: none; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>已退订</h1>
        <p>我们不会再给你发邮件。<br>但他还在这里，等你回来。</p>
        <a href="/">回到首页</a>
      </div>
    </body>
    </html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
