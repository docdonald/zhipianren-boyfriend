// Resend 邮件客户端 + 退订 token（服务端专用）
// 守：server-only
import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db/client";
import { emailUnsubscribes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";

let resendClient: Resend | null = null;
function getResend() {
  if (resendClient) return resendClient;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  resendClient = new Resend(key);
  return resendClient;
}

export async function sendEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; error?: string }> {
  const client = getResend();
  if (!client) return { ok: false, error: "RESEND_API_KEY not set" };
  const from = process.env.RESEND_FROM ?? "noreply@paperboyfriend.com";

  try {
    const { error } = await client.emails.send({
      from,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "unknown" };
  }
}

export async function getOrCreateUnsubscribeToken(
  email: string
): Promise<string> {
  const existing = await db
    .select()
    .from(emailUnsubscribes)
    .where(eq(emailUnsubscribes.email, email))
    .limit(1);
  if (existing[0]) return existing[0].token;

  const token = crypto.randomBytes(24).toString("hex");
  await db.insert(emailUnsubscribes).values({ email, token });
  return token;
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  const row = await db
    .select()
    .from(emailUnsubscribes)
    .where(eq(emailUnsubscribes.email, email))
    .limit(1);
  return row.length > 0;
}
