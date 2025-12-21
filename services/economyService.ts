import { User } from '../types';

export const MAX_QUEST_COINS_PER_UNIT: Record<string, number> = {
  u1: 100,
  u2: 100,
  u3: 120,
  u4: 120,
  u5: 120,
  u6: 100,
};

export function computeEntryFee(reward: number): number {
  const raw = Math.round(reward * 0.15);
  return Math.min(60, Math.max(10, raw));
}

export function getQuestCap(user: User, unitId: string): number {
  return MAX_QUEST_COINS_PER_UNIT[unitId] ?? Number.POSITIVE_INFINITY;
}

export function getQuestCoinsEarned(user: User, unitId: string): number {
  return user.questCoinsEarnedByUnit?.[unitId] ?? 0;
}

export function getQuestCapRemaining(user: User, unitId: string): number {
  const cap = getQuestCap(user, unitId);
  if (!isFinite(cap)) return Number.POSITIVE_INFINITY;
  const earned = getQuestCoinsEarned(user, unitId);
  return Math.max(0, cap - earned);
}

export function applyQuestRewardCap(
  user: User,
  unitId: string,
  requestedAmount: number
): { user: User; awarded: number } {
  const cap = getQuestCap(user, unitId);
  const earned = getQuestCoinsEarned(user, unitId);

  if (requestedAmount <= 0) {
    return { user, awarded: 0 };
  }

  const remaining = isFinite(cap) ? Math.max(0, cap - earned) : requestedAmount;
  const award = Math.min(requestedAmount, remaining);

  if (award <= 0) {
    return { user, awarded: 0 };
  }

  const updatedUser: User = {
    ...user,
    coins: user.coins + award,
    totalEarned: user.totalEarned + award,
    questCoinsEarnedByUnit: {
      ...(user.questCoinsEarnedByUnit || {}),
      [unitId]: earned + award,
    },
  };

  return { user: updatedUser, awarded: award };
}

export function isQuestCapReached(user: User, unitId: string): boolean {
  const remaining = getQuestCapRemaining(user, unitId);
  return Number.isFinite(remaining) && remaining <= 0;
}

