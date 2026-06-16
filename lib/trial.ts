// 免费试用工具
// 逻辑：未登录用户每角色可免费对话 5 轮（5 轮 user 消息）
// 计数同时存到 localStorage（持久）和 cookie（兜底）

export const FREE_TRIAL_LIMIT = 5;

const TRIAL_KEY = "pb.trial"; // localStorage key

export interface TrialState {
  // 各角色已用轮数
  counts: Record<string, number>;
}

export function readTrial(): TrialState {
  if (typeof window === "undefined") return { counts: {} };
  try {
    const raw = window.localStorage.getItem(TRIAL_KEY);
    if (!raw) return { counts: {} };
    const parsed = JSON.parse(raw) as TrialState;
    return {
      counts: parsed.counts && typeof parsed.counts === "object" ? parsed.counts : {},
    };
  } catch {
    return { counts: {} };
  }
}

export function writeTrial(state: TrialState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TRIAL_KEY, JSON.stringify(state));
  } catch {
    // 忽略
  }
}

export function getTrialCount(characterId: string): number {
  return readTrial().counts[characterId] ?? 0;
}

export function incrementTrial(characterId: string): number {
  const state = readTrial();
  const current = state.counts[characterId] ?? 0;
  const next = current + 1;
  state.counts[characterId] = next;
  writeTrial(state);
  return next;
}

export function isTrialExhausted(characterId: string): boolean {
  return getTrialCount(characterId) >= FREE_TRIAL_LIMIT;
}

export function remainingTrial(characterId: string): number {
  return Math.max(0, FREE_TRIAL_LIMIT - getTrialCount(characterId));
}
