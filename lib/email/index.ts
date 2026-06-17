export {
  sendEmail,
  getOrCreateUnsubscribeToken,
  isUnsubscribed,
  sendWelcomeEmail,
} from "./resend";

// TODO: 实现每日情话发送逻辑
export async function sendDailyLoveLetterToAll(): Promise<void> {
  console.log("[daily-email] sendDailyLoveLetterToAll called (placeholder)");
  // 后续实现：查询所有活跃用户，生成个性化情话，逐条发送
}
