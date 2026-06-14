// 登录页
import { signIn } from "@/lib/auth";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { verify?: string; callbackUrl?: string };
}) {
  const isVerify = searchParams.verify === "1";
  const callbackUrl = searchParams.callbackUrl ?? "/";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#1a1a1a] text-white p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">纸片人男友</h1>
          <p className="text-white/60 mt-2 text-sm">4 个平行世界的他，等你</p>
        </div>

        {isVerify ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-lg font-semibold mb-2">查看你的邮箱</h2>
            <p className="text-white/60 text-sm">
              我们已把登录链接发到你的邮箱。
              <br />
              点击链接即可进入。
            </p>
          </div>
        ) : (
          <form
            action={async (formData) => {
              "use server";
              const email = formData.get("email")?.toString() ?? "";
              if (!email) return;
              await signIn("resend", { email, redirectTo: callbackUrl });
            }}
            className="rounded-2xl border border-white/10 bg-white/5 p-6"
          >
            <h2 className="text-lg font-semibold mb-1">用邮箱登录</h2>
            <p className="text-white/50 text-xs mb-5">
              无需密码。我们会发一封登录链接到你的邮箱。
            </p>
            <input
              name="email"
              type="email"
              required
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 mb-3"
            />
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-full bg-white text-black font-medium text-sm hover:bg-white/90"
            >
              发送登录链接
            </button>
          </form>
        )}

        <p className="text-white/30 text-xs text-center mt-6">
          登录后，他会在邮箱里偶尔想起你。
          <br />
          你可以随时退订。
        </p>
      </div>
    </main>
  );
}
