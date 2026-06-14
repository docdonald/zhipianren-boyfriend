import Link from "next/link";

export const metadata = {
  title: "隐私政策 · 纸片人男友",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-white/40 hover:text-white text-sm mb-8 inline-block"
        >
          ← 返回首页
        </Link>

        <h1 className="font-serif-cn text-3xl md:text-4xl mb-2" style={{ fontWeight: 300 }}>
          隐私政策
        </h1>
        <p className="text-white/40 text-sm mb-10">
          最后更新日期：2025 年 1 月
        </p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-white text-base font-medium mb-3">1. 我们收集哪些信息</h2>
            <p className="mb-3">
              为了提供「纸片人男友」的对话与记忆服务，我们可能会收集以下类型的数据：
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>
                <span className="text-white/70">账户信息</span>：邮箱地址（用于登录和身份识别）、加密后的密码哈希（不存储明文密码）。
              </li>
              <li>
                <span className="text-white/70">对话内容</span>：你与角色之间的聊天记录，用于生成「回忆录」和维持上下文连贯性。
              </li>
              <li>
                <span className="text-white/70">使用数据</span>：对话轮次、活跃时间等，用于免费额度统计与产品优化。
              </li>
              <li>
                <span className="text-white/70">设备与技术信息</span>：浏览器类型、IP 地址（用于安全风控与反滥用）。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">2. 我们如何使用这些信息</h2>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>提供、维护和改进对话服务与角色体验。</li>
              <li>生成并展示你的专属「回忆录」。</li>
              <li>管理免费对话额度与付费订阅。</li>
              <li>发送服务通知（如账户安全提醒、功能更新）。</li>
              <li>防止欺诈、滥用与安全问题。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">3. 你的数据控制权</h2>
            <p className="mb-3">
              你对个人数据拥有以下权利：
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>
                <span className="text-white/70">查看</span>：你可以在「回忆录」页面查看自己的对话历史。
              </li>
              <li>
                <span className="text-white/70">修改</span>：你可以随时更新账户邮箱或密码。
              </li>
              <li>
                <span className="text-white/70">删除</span>：如需删除账户及全部关联数据，请发送邮件至 <a href="mailto:support@paperboyfriend.com" className="text-white/80 underline underline-offset-4">support@paperboyfriend.com</a>，我们将在 15 个工作日内处理。
              </li>
              <li>
                <span className="text-white/70">导出</span>：你可以随时导出个人对话记录（功能开发中）。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">4. 数据共享与第三方</h2>
            <p className="mb-3">
              我们<span className="text-white">不会出售你的个人数据</span>。仅在以下有限情形下与第三方共享：
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>
                <span className="text-white/70">AI 服务提供商</span>：你的对话内容会发送至火山引擎（豆包大模型）和 Seedream（图像生成）以生成回复与图片。我们要求这些服务商遵守同等的数据保护标准。
              </li>
              <li>
                <span className="text-white/70">云基础设施</span>：数据存储在 Neon PostgreSQL 云服务中，由其提供数据库托管与安全保障。
              </li>
              <li>
                <span className="text-white/70">法律要求</span>：仅在法律法规要求或保护我们合法权益的必要情况下，向有关部门披露。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">5. 安全措施</h2>
            <ul className="list-disc list-inside space-y-1.5 text-white/60">
              <li>密码采用 bcrypt 算法加密存储，不以明文形式保存。</li>
              <li>数据库连接使用 SSL/TLS 加密传输。</li>
              <li>会话管理通过 JWT + HttpOnly Cookie 实现，降低 XSS 风险。</li>
              <li>定期审查访问日志，监控异常行为。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">6. 数据保留</h2>
            <p>
              账户活跃期间，你的对话记录和个人信息将被保留以维持服务连续性。如果你删除账户，相关数据将在 30 天内从生产环境中清除（部分匿名化统计信息可能保留用于分析）。
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">7. 未成年人保护</h2>
            <p>
              本服务面向年满 18 岁的用户。如果我们发现未成年人提供了个人信息，将立即删除相关数据并终止服务。
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">8. 政策更新</h2>
            <p>
              我们可能会不时更新本隐私政策。重大变更时，我们会在网站显眼位置发布通知，并更新上方的「最后更新日期」。
            </p>
          </section>

          <section>
            <h2 className="text-white text-base font-medium mb-3">9. 联系我们</h2>
            <p>
              如对隐私政策有任何疑问或行使你的数据权利，请发送邮件至{" "}
              <a href="mailto:support@paperboyfriend.com" className="text-white/80 underline underline-offset-4">
                support@paperboyfriend.com
              </a>
              。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
