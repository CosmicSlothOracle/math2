
import { User } from '../types';
import { DataService } from './apiService';
import { applyQuestRewardCap } from './economyService';

type QuestRunType = 'standard' | 'bounty';

async function applyQuestCoinsDelta(
  user: User,
  unitId: string,
  delta: number,
  questType: QuestRunType
): Promise<{ user: User; applied: number }> {
  if (delta === 0) {
    return { user, applied: 0 };
  }

  let workingUser: User = { ...user };
  let appliedAmount = delta;

  if (delta > 0) {
    if (questType === 'standard') {
      const { user: withCapApplied, awarded } = applyQuestRewardCap(workingUser, unitId, delta);
      workingUser = withCapApplied;
      appliedAmount = awarded;
    } else {
      workingUser = {
        ...workingUser,
        coins: workingUser.coins + delta,
        totalEarned: workingUser.totalEarned + delta,
      };
      appliedAmount = delta;
    }
  } else {
    const previousCoins = workingUser.coins;
    const newCoins = Math.max(0, previousCoins + delta);
    workingUser = {
      ...workingUser,
      coins: newCoins,
    };
    appliedAmount = newCoins - previousCoins;
  }

  await DataService.updateUser(workingUser);
  return { user: workingUser, applied: appliedAmount };
}

export const QuestService = {
  awardCoinsForQuestion: async (
    user: User,
    unitId: string,
    questionId: string,
    baseCoins: number,
    questType: QuestRunType
  ): Promise<{ updatedUser: User; coinsAwarded: number }> => {
    if (user.solvedQuestionIds.includes(questionId) || baseCoins <= 0) {
      return { updatedUser: user, coinsAwarded: 0 };
    }

    const solvedUser: User = {
      ...user,
      solvedQuestionIds: [...user.solvedQuestionIds, questionId],
    };

    const { user: updatedUser, applied } = await applyQuestCoinsDelta(
      solvedUser,
      unitId,
      baseCoins,
      questType
    );

    return { updatedUser, coinsAwarded: applied };
  },

  completeStandardQuest: async (
    user: User,
    unitId: string,
    reward: number
  ): Promise<{ updatedUser: User; coinsAwarded: number }> => {
    const progressUser: User = {
      ...user,
      completedUnits: [...new Set([...user.completedUnits, unitId])],
    };

    const { user: updatedUser, applied } = await applyQuestCoinsDelta(
      progressUser,
      unitId,
      reward,
      'standard'
    );

    return { updatedUser, coinsAwarded: applied };
  },

  completeBountyQuest: async (
    user: User,
    unitId: string,
    reward: number
  ): Promise<{ updatedUser: User; coinsAwarded: number }> => {
    const alreadyClaimed = user.bountyPayoutClaimed?.[unitId] ?? false;
    const masteredSet = [...new Set([...user.masteredUnits, unitId])];

    let updatedUser: User = {
      ...user,
      masteredUnits: masteredSet,
      bountyPayoutClaimed: {
        ...(user.bountyPayoutClaimed || {}),
        ...(alreadyClaimed ? {} : { [unitId]: true }),
      },
    };

    let coinsAwarded = 0;
    if (!alreadyClaimed && reward > 0) {
      coinsAwarded = reward;
      updatedUser = {
        ...updatedUser,
        coins: updatedUser.coins + reward,
        totalEarned: updatedUser.totalEarned + reward,
        bountyPayoutClaimed: {
          ...(updatedUser.bountyPayoutClaimed || {}),
          [unitId]: true,
        },
      };
    }

    await DataService.updateUser(updatedUser);
    return { updatedUser, coinsAwarded };
  },

  completePreQuest: async (user: User, unitId: string): Promise<User> => {
    const updatedUser: User = {
      ...user,
      preClearedUnits: [...new Set([...user.preClearedUnits, unitId])],
    };
    await DataService.updateUser(updatedUser);
    return updatedUser;
  },

  startBountyAttempt: async (user: User, unitId: string, entryFee: number): Promise<User> => {
    if (entryFee <= 0) {
      return user;
    }
    if (user.coins < entryFee) {
      throw new Error('INSUFFICIENT_COINS');
    }
    const updatedUser: User = {
      ...user,
      coins: user.coins - entryFee,
    };
    await DataService.updateUser(updatedUser);
    return updatedUser;
  },

  adjustCoinsForQuest: async (
    user: User,
    unitId: string,
    delta: number,
    questType: QuestRunType
  ): Promise<{ updatedUser: User; coinsDelta: number }> => {
    const { user: updatedUser, applied } = await applyQuestCoinsDelta(user, unitId, delta, questType);
    return { updatedUser, coinsDelta: applied };
  },
};
