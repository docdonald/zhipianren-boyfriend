// 4 角色 prompt 注册 + 统一入口
import type { CharacterId } from "./types";
import { LIN_XU_BAI_PROMPT } from "./lin-xu-bai/prompt";
import { ZHOU_MU_PROMPT } from "./zhou-mu/prompt";
import { JIANG_YU_PROMPT } from "./jiang-yu/prompt";
import { XIA_YE_PROMPT } from "./xia-ye/prompt";

const PROMPTS: Record<CharacterId, string> = {
  "lin-xu-bai": LIN_XU_BAI_PROMPT,
  "zhou-mu": ZHOU_MU_PROMPT,
  "jiang-yu": JIANG_YU_PROMPT,
  "xia-ye": XIA_YE_PROMPT,
};

export function getSystemPrompt(characterId: CharacterId): string {
  const prompt = PROMPTS[characterId];
  if (!prompt) {
    throw new Error(`Unknown character: ${characterId}`);
  }
  return prompt;
}
