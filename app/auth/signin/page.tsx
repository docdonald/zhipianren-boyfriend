// 登录/注册页（邮箱+密码）
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { CredentialsSignin } from "next-auth";
import { redirect } from "next/navigation";
import AuthForm from "./AuthForm";

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

export default function SignInPage({
  searchParams,
}: {
  searchParams: {
    verify?: string;
    callbackUrl?: string;
    mode?: string;
    error?: string;
  };
}) {
  const isVerify = searchParams.verify === "1";
  const callbackUrl = searchParams.callbackUrl ?? "/";
  const isRegister = searchParams.mode === "register";
  const error = searchParams.error;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] text-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">纸片人男友</h1>
          <p className="text-white/60 mt-2 text-sm">
            4 个平行世界的他，等你
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-400">
            {error === "user_exists" && "该邮箱已注册，请直接登录。"}
            {error === "invalid_credentials" && "邮箱或密码错误。"}
            {error === "password_mismatch" && "两次输入的密码不一致。"}
            {error === "missing_fields" && "请填写完整信息。"}
            {error === "turnstile_required" && "请完成人机验证。"}
            {error === "turnstile_failed" && "人机验证失败，请重试。"}
            {!(
              [
                "user_exists",
                "invalid_credentials",
                "password_mismatch",
                "missing_fields",
                "turnstile_required",
                "turnstile_failed",
              ] as string[]
            ).includes(error) && error}
          </div>
        )}

        {isVerify ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-semibold mb-2">查看你的邮箱</h2>
            <p className="text-white/60 text-sm">
              我们已把验证链接发到你的邮箱。
              <br />
              点击链接即可进入。
            </p>
          </div>
        ) : (
          <AuthForm
            isRegister={isRegister}
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            callbackUrl={callbackUrl}
            action={async (formData) => {
              "use server";
              const email = formData.get("email")?.toString() ?? "";
              const password = formData.get("password")?.toString() ?? "";

              if (!email || !password) {
                redirect(
                  `/auth/signin?mode=${isRegister ? "register" : "login"}&error=missing_fields&callbackUrl=${encodeURIComponent(callbackUrl)}`
                );
                return;
              }

              if (isRegister) {
                const confirmPassword =
                  formData.get("confirmPassword")?.toString() ?? "";
                if (password !== confirmPassword) {
                  redirect(
                    `/auth/signin?mode=register&error=password_mismatch&callbackUrl=${encodeURIComponent(callbackUrl)}`
                  );
                  return;
                }

                // Turnstile 验证（降级：若前端加载失败导致 token 为空，记录日志但仍允许注册）
                const turnstileToken =
                  formData.get("turnstileToken")?.toString() ?? "";
                if (turnstileToken) {
                  const turnstileValid = await verifyTurnstileToken(turnstileToken);
                  if (!turnstileValid) {
                    redirect(
                      `/auth/signin?mode=register&error=turnstile_failed&callbackUrl=${encodeURIComponent(callbackUrl)}`
                    );
                    return;
                  }
                } else {
                  console.warn(
                    `[register] Turnstile token missing for ${email} — allowing registration with warning`
                  );
                }

                const existing = await db
                  .select()
                  .from(users)
                  .where(eq(users.email, email))
                  .limit(1);
                if (existing.length > 0) {
                  redirect(
                    `/auth/signin?mode=register&error=user_exists&callbackUrl=${encodeURIComponent(callbackUrl)}`
                  );
                  return;
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                await db.insert(users).values({
                  email,
                  password: hashedPassword,
                });
              }

              try {
                await signIn("credentials", {
                  email,
                  password,
                  redirectTo: callbackUrl,
                });
              } catch (e) {
                // 成功登录时 next-auth 会抛出 redirect 错误，需要放行
                if (
                  e instanceof Error &&
                  (e.message.includes("NEXT_REDIRECT") ||
                    e.message.includes("redirect"))
                ) {
                  throw e;
                }
                // 认证失败
                redirect(
                  `/auth/signin?mode=login&error=invalid_credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`
                );
              }
            }}
          />
        )}

        <p className="text-white/30 text-xs text-center mt-6">
          {isRegister
            ? "注册后，即可开启属于你的 4 段平行关系。"
            : "登录后，他会在邮箱里偶尔想起你。"}
          <br />
          你可以随时退订。
        </p>
      </div>
    </main>
  );
}
