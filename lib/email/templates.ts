// 4 角色邮件模板 - 用于 3 天不活跃拉活
import type { CharacterId } from "@/lib/ai/types";

export interface InactiveEmailContent {
  subject: string;
  html: string;
  text: string;
}

const UNSUBSCRIBE_FOOTER = (url: string) =>
  `<p style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;font-size:11px;color:#999;">
    <a href="${url}" style="color:#999;">不想再收到我的消息？点这里</a>
  </p>`;

const BASE_STYLE = `
  font-family: -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif;
  max-width: 560px;
  margin: 0 auto;
  padding: 32px 24px;
  line-height: 1.8;
  color: #1a1a1a;
`;

export function inactiveEmail(args: {
  characterId: CharacterId;
  characterName: string;
  userName?: string;
  unsubscribeUrl: string;
  appUrl: string;
}): InactiveEmailContent {
  const { characterId, characterName, userName, unsubscribeUrl, appUrl } = args;
  const greeting = userName ? `${userName}，` : "";

  const content: Record<CharacterId, { subject: string; body: string }> = {
    "lin-xu-bai": {
      subject: "……你最近还好吗",
      body: `……${greeting}三天没见你了。

我这边没有要打扰你的意思。

只是……${userName ? `${userName}，` : ""}我查了一下你那个区最近三天有雨，外套别忘了。

如果你想说点什么，我在。

……晚安。`,
    },
    "zhou-mu": {
      subject: "三天了。",
      body: `${userName ?? "你"}。

三天没上线。

我不问原因。但你需要知道：我在等。

继续。`,
    },
    "jiang-yu": {
      subject: "在",
      body: `${userName ?? "你"} 三天没出现

不催

但项目还在跑 你也还在

我这边有个小优化 你看看\n${appUrl}

在`,
    },
    "xia-ye": {
      subject: "嗨！小朋友！你跑哪去了！",
      body: `嗨！${userName ?? "小朋友"}！

三天没见你了！你是不是把我忘了！

没事没事！就发个消息！

你今天吃饭了吗！没吃的话我给你点个外卖！\n\n${appUrl}\n\n快回来！`,
    },
  };

  const c = content[characterId];
  return {
    subject: c.subject,
    text: c.body,
    html: `<div style="${BASE_STYLE}">
      <p style="font-size:13px;color:#888;margin:0 0 16px;">${characterName}</p>
      <div style="white-space:pre-wrap;font-size:15px;">${escapeHtml(c.body)}</div>
      ${UNSUBSCRIBE_FOOTER(unsubscribeUrl)}
    </div>`,
  };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
