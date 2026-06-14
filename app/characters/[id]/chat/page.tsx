// 聊天页 - Server Component
// 职责：支持登录用户和匿名用户
// - 登录：加载服务端历史 + 亲密度状态
// - 匿名：发送空初始历史 + 标记为免费试用
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getCharacter } from "@/lib/ai/characters";
import { db } from "@/lib/db/client";
import { conversations, characterState } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";
import ChatClient from "./ChatClient";
import type { CharacterId } from "@/lib/ai/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function ChatPage({ params }: PageProps) {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const userId = isLoggedIn
    ? (session!.user as { id?: string }).id ?? null
    : null;

  const character = getCharacter(params.id);
  if (!character) notFound();

  // 登录用户：加载历史 + state
  let initialMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [];
  let initialStage = 1;

  if (isLoggedIn && userId) {
    const history = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.userId, userId),
          eq(conversations.characterId, params.id)
        )
      )
      .orderBy(asc(conversations.createdAt))
      .limit(30);

    initialMessages = history.map((h) => ({
      role: h.role as "user" | "assistant" | "system",
      content: h.content,
    }));

    const state = (
      await db
        .select()
        .from(characterState)
        .where(
          and(
            eq(characterState.userId, userId),
            eq(characterState.characterId, params.id)
          )
        )
        .limit(1)
    )[0];

    if (state) {
      initialStage = state.intimacyStage;
    } else {
      // 初始化 state
      await db.insert(characterState).values({
        userId,
        characterId: params.id,
        intimacyStage: 1,
        intimacyScore: 0,
        characterData: {},
      });
    }
  }

  return (
    <ChatClient
      character={character}
      isLoggedIn={isLoggedIn}
      userId={userId}
      initialMessages={initialMessages}
      initialStage={initialStage}
    />
  );
}
