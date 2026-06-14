// 数据库 schema - 覆盖账号/记忆/亲密度/邮件订阅
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ===== NextAuth 必需表 =====

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // 密码（bcrypt 哈希）
  password: text("password"),
  // 业务字段
  onboardedAt: timestamp("onboarded_at", { mode: "date" }),
  // 邮件订阅
  emailOptIn: boolean("email_opt_in").default(true),
  // 活跃时间
  lastSeenAt: timestamp("last_seen_at", { mode: "date" }),
});

export const accounts = pgTable(
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

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ===== 业务表 =====

// 角色表（程序化注册，但状态可独立存）
export const characterState = pgTable(
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
    characterData: jsonb("character_data")
      .notNull()
      .$type<CharacterData>(),
    // 时间
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.characterId] }),
  })
);

// 对话历史（服务端记忆）
export const conversations = pgTable("conversation", {
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
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
});

// 用户偏好（每个角色独立）
export const userProfile = pgTable(
  "user_profile",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    characterId: text("character_id").notNull(),
    displayName: text("display_name"), // 用户在角色眼中的昵称
    preferences: jsonb("preferences")
      .notNull()
      .$type<Record<string, unknown>>()
      .default({}),
    forbiddenTouched: boolean("forbidden_touched")
      .notNull()
      .default(false),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.characterId] }),
  })
);

// 邮件退订表
export const emailUnsubscribes = pgTable(
  "email_unsubscribe",
  {
    email: text("email").notNull(),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("unsub_email_idx").on(t.email),
  })
);

// 跃迁事件表
export const intimacyEvents = pgTable("intimacy_event", {
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
  createdAt: timestamp("created_at", { mode: "date" })
    .notNull()
    .defaultNow(),
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
  resourceQuota?: number;
  lastSpendTs?: number;
  // 夏野
  nightModeActive?: boolean;
  lastNightConfession?: string;
  daytimeDeflectionCount?: number;
  // 通用运行时字段
  keyEvents?: Array<{ kind: string; note: string; ts: number }>;
  lastImageAt?: number;
}
