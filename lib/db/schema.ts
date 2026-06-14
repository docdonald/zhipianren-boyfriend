// 数据库 schema - 覆盖账号/记忆/亲密度/邮件订阅
import { sql } from "drizzle-orm";
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ===== NextAuth 必需表 =====

export const users = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp_ms" }),
  image: text("image"),
  // 业务字段
  onboardedAt: integer("onboarded_at", { mode: "timestamp_ms" }),
  // 邮件订阅
  emailOptIn: integer("email_opt_in", { mode: "boolean" }).default(true),
  // 活跃时间
  lastSeenAt: integer("last_seen_at", { mode: "timestamp_ms" }),
});

export const accounts = sqliteTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ===== 业务表 =====

// 角色表（程序化注册，但状态可独立存）
export const characterState = sqliteTable(
  "character_state",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    characterId: text("character_id").notNull(), // lin-xu-bai / zhou-mu / jiang-yu / xia-ye
    // 亲密度
    intimacyStage: integer("intimacy_stage").notNull().default(1), // 1-6
    intimacyScore: integer("intimacy_score").notNull().default(0), // 0-1000
    // 角色专属字段（JSON）
    characterData: text("character_data", { mode: "json" })
      .notNull()
      .$type<CharacterData>(),
    // 时间
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.characterId] }),
  })
);

// 对话历史（服务端记忆）
export const conversations = sqliteTable("conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  characterId: text("character_id").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  // 当时的亲密度阶段（用于审计）
  intimacyStage: integer("intimacy_stage").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// 用户偏好（每个角色独立）
export const userProfile = sqliteTable(
  "user_profile",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    characterId: text("character_id").notNull(),
    displayName: text("display_name"), // 用户在角色眼中的昵称
    preferences: text("preferences", { mode: "json" })
      .notNull()
      .$type<Record<string, unknown>>()
      .default({}),
    forbiddenTouched: integer("forbidden_touched", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.characterId] }),
  })
);

// 邮件退订表
export const emailUnsubscribes = sqliteTable(
  "email_unsubscribe",
  {
    email: text("email").notNull(),
    token: text("token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => ({
    emailIdx: uniqueIndex("unsub_email_idx").on(t.email),
  })
);

// 跃迁事件表
export const intimacyEvents = sqliteTable("intimacy_event", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  characterId: text("character_id").notNull(),
  fromStage: integer("from_stage").notNull(),
  toStage: integer("to_stage").notNull(),
  reason: text("reason").notNull(), // judge 输出的原因
  judgeRaw: text("judge_raw"), // judge 的完整 JSON
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

// ===== 类型 =====

export type CharacterId =
  | "lin-xu-bai"
  | "zhou-mu"
  | "jiang-yu"
  | "xia-ye";

// 各角色 character_data 形状（松散 JSON）
export interface CharacterData {
  // 林叙白
  collectedEvidence?: string[];
  invasionDepth?: number;
  lastPrediction?: string;
  // 周牧
  testHistory?: Array<{ test: string; response: string; ts: number }>;
  controlResistance?: number;
  boundaryCrossed?: string[];
  gameRound?: number;
  controlIntensity?: number;
  // 江屿
  resourceInvested?: Array<{ kind: string; value: string; ts: number }>;
  // 夏野
  sunlightLevel?: number; // 0-100
  // 通用
  emotionHistory?: Array<{ emotion: string; ts: number }>;
  keyEvents?: Array<{ kind: string; note: string; ts: number }>;
  vulnerabilityExposed?: boolean;
}
