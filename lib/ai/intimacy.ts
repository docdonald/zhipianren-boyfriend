// 6 阶段亲密度框架
// 阶段 1-2: 互动量驱动
// 阶段 3-4: 互动量 + 关键事件
// 阶段 5-6: 跃迁钥匙 + 极端情境

import type { CharacterId } from "@/lib/ai/types";

export const STAGE_NAMES: Record<number, string> = {
  1: "初识",
  2: "熟悉",
  3: "依赖",
  4: "脆弱",
  5: "确认",
  6: "告白",
};

// 互动量阈值（粗筛）
export const STAGE_BY_COUNT: Array<{ stage: number; minCount: number }> = [
  { stage: 1, minCount: 0 },
  { stage: 2, minCount: 20 },
  { stage: 3, minCount: 100 },
  { stage: 4, minCount: 300 },
  { stage: 5, minCount: 500 },
  { stage: 6, minCount: 800 },
];

// 各角色跃迁钥匙：阶段 5 → 6 需满足
export const TRANSITION_KEYS: Record<CharacterId, string[]> = {
  "lin-xu-bai": [
    "用户主动说出『你不要这样』",
    "用户发现他的『没有自己』并质问",
  ],
  "zhou-mu": [
    "用户连续 3 次突破他设的边界且未离场",
    "用户说『我不想你控制我，但我也不走』",
  ],
  "jiang-yu": [
    "用户拒绝他的资源投放并说『我不要你的东西』",
    "用户在他算不清账时留下",
  ],
  "xia-ye": [
    "用户在他断电时未追问、只说『我在』",
    "用户接受他用全名叫她",
  ],
};

// 阶段文案注入（让 prompt 知道当前阶段）
export function stageDirective(
  characterId: CharacterId,
  stage: number
): string {
  if (stage <= 1) {
    return `【当前阶段：1-初识】保持距离感，仅礼貌回应，不主动暴露内在印记。`;
  }
  if (stage === 2) {
    return `【当前阶段：2-熟悉】开始出现固定互动节奏，可以主动关心。`;
  }
  if (stage === 3) {
    return `【当前阶段：3-依赖】建立固定对话仪式，小情绪开始出现。`;
  }
  if (stage === 4) {
    return `【当前阶段：4-脆弱】可以触发关键事件，释放人设极致张力。`;
  }
  if (stage === 5) {
    return `【当前阶段：5-确认】必须完成跃迁钥匙，验证关系定义。`;
  }
  return `【当前阶段：6-告白】满足告白条件后可以告白。`;
}

// 由互动量粗算阶段
export function stageByCount(count: number): number {
  let stage = 1;
  for (const item of STAGE_BY_COUNT) {
    if (count >= item.minCount) stage = item.stage;
  }
  return stage;
}
