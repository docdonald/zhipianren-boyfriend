import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    }
  );

  const data = await response.json();
  return data.success === true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { turnstileToken, email, password, confirmPassword, name } = body;

    // 1. Turnstile 验证（降级：若 token 为空，记录日志但仍允许注册）
    if (turnstileToken && typeof turnstileToken === "string") {
      const turnstileValid = await verifyTurnstileToken(turnstileToken);
      if (!turnstileValid) {
        return NextResponse.json(
          { error: "turnstile_failed", message: "人机验证失败，请重试。" },
          { status: 400 }
        );
      }
    } else {
      console.warn(
        `[api/register] Turnstile token missing for ${email} — allowing registration with warning`
      );
    }

    // 2. 基础字段校验
    if (!email || !password) {
      return NextResponse.json(
        { error: "missing_fields", message: "请填写完整信息。" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "password_mismatch", message: "两次输入的密码不一致。" },
        { status: 400 }
      );
    }

    // 3. 检查邮箱是否已注册
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "user_exists", message: "该邮箱已注册，请直接登录。" },
        { status: 409 }
      );
    }

    // 4. 哈希密码并写入数据库
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name: name || null,
    });

    // 注册成功后发送欢迎邮件（失败不影响注册）
    try {
      const { sendWelcomeEmail } = await import("@/lib/email/resend");
      await sendWelcomeEmail(email, name || "新朋友");
    } catch (error) {
      console.error("欢迎邮件发送失败：", error);
    }

    return NextResponse.json(
      { success: true, message: "注册成功" },
      { status: 201 }
    );
  } catch (err) {
    console.error("[register api] error:", err);
    return NextResponse.json(
      { error: "internal_error", message: "服务器错误，请稍后重试。" },
      { status: 500 }
    );
  }
}
