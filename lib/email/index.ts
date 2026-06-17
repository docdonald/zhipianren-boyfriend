import {
  sendEmail,
  getOrCreateUnsubscribeToken,
  isUnsubscribed,
  sendWelcomeEmail,
} from "./resend";

export { sendEmail, getOrCreateUnsubscribeToken, isUnsubscribed, sendWelcomeEmail };

// 情话模板库（按日期轮换，给所有用户同一天看到不同风格的情话）
const LOVE_TEMPLATES = [
  (name: string) =>
    `早安，${name}。今天醒来第一个念头就是你，窗外的阳光都没你亮眼。`,
  (name: string) =>
    `${name}，今天也想你了。不是那种轰轰烈烈的想，是风吹过来、咖啡凉了、路过花店都会想起你的那种想。`,
  (name: string) =>
    `嘿 ${name}，昨晚梦到你了，醒来发现被子掉了一半——大概是被我踢的，因为梦里一直在追你。`,
  (name: string) =>
    `早安 ${name}。你今天打算做什么？不管做什么，记得你正在被某个人偷偷惦记着。`,
  (name: string) =>
    `${name}，今天的天空是浅蓝色的，像你上次笑起来的样子。希望你今天也能那样笑。`,
  (name: string) =>
    `早上好 ${name}。如果你现在还没醒，那这条消息就是你的闹钟；如果你已经醒了，那它就是你今天的第一个拥抱。`,
  (name: string) =>
    `${name}，我今天特别想你。不是一般般的想，是想冲到你面前、把一整天的废话都说给你听的那种想。`,
];

// 根据日期和用户名生成当天的情话
export async function generateLoveLetter(userName: string): Promise<string> {
  // 用日期作为种子，保证同一天所有用户看到同一封"风格"的情话
  const dayIndex = new Date().getDate() % LOVE_TEMPLATES.length;
  const template = LOVE_TEMPLATES[dayIndex];
  return template(userName || "亲爱的");
}

// 给单个用户发每日情话
export async function sendDailyLoveLetter(
  userEmail: string,
  userName: string
): Promise<{ ok: boolean; error?: string }> {
  const { sendEmail } = await import("./resend");

  const loveLetter = await generateLoveLetter(userName);

  return sendEmail({
    to: userEmail,
    subject: `早安 ${userName || "亲爱的"}，今天也想你了`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <p>${loveLetter}</p>
        <br/>
        <p>—— 你的纸片人男友</p>
        <p style="color: #999; font-size: 12px;">
          想跟我聊天？<a href="https://www.2dboyfriend.online">点这里回来找我</a>
        </p>
      </div>
    `,
    text: `${loveLetter}\n\n—— 你的纸片人男友\n\n想跟我聊天？访问 https://www.2dboyfriend.online`,
  });
}

// 给所有用户发每日情话（定时任务调用）
export async function sendDailyLoveLetterToAll(): Promise<void> {
  console.log("[daily-email] sendDailyLoveLetterToAll started");

  const { db } = await import("@/lib/db/client");
  const { users } = await import("@/lib/db/schema");
  const { isNotNull } = await import("drizzle-orm");

  // 从数据库拿到所有有邮箱的用户
  const allUsers = await db
    .select()
    .from(users)
    .where(isNotNull(users.email));

  for (const user of allUsers) {
    if (!user.email) continue;

    // 跳过已退订用户
    if (await isUnsubscribed(user.email)) {
      console.log(`[daily-email] skipped unsubscribed: ${user.email}`);
      continue;
    }

    try {
      await sendDailyLoveLetter(user.email, user.name || "亲爱的");
      console.log(`[daily-email] sent to ${user.email}`);
    } catch (error) {
      console.error(`给 ${user.email} 发情话失败：`, error);
      // 某个用户失败不影响其他用户
    }
  }

  console.log("[daily-email] sendDailyLoveLetterToAll finished");
}
