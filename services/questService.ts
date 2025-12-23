
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
      // apply client-side cap logic to determine awarded amount and update local progress flags
      const { user: withCapApplied, awarded } = applyQuestRewardCap(workingUser, unitId, delta);
      workingUser = withCapApplied;
      appliedAmount = awarded;
      if (appliedAmount > 0) {
        // call server to apply coins (server authoritative)
        try {
          const resp = await fetch('/.netlify/functions/coinsAdjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ delta: appliedAmount, reason: 'quest_reward', refType: 'unit', refId: unitId }),
          });
          const json = await resp.json();
          const applied = typeof json.applied === 'number' ? json.applied : appliedAmount;
          const coins = typeof json.coins === 'number' ? json.coins : (workingUser.coins + applied);
          workingUser.coins = coins;
          workingUser.totalEarned = (workingUser.totalEarned || 0) + applied;
          appliedAmount = applied;
        } catch (err) {
          console.warn('coinsAdjust failed', err);
        }
      } else {
        appliedAmount = 0;
      }
    } else {
      // non-standard quests: request server to apply delta directly
      try {
        const resp = await fetch('/.netlify/functions/coinsAdjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta, reason: 'quest_adjust', refType: 'unit', refId: unitId }),
        });
        const json = await resp.json();
        const applied = typeof json.applied === 'number' ? json.applied : delta;
        const coins = typeof json.coins === 'number' ? json.coins : (workingUser.coins + applied);
        workingUser.coins = coins;
        workingUser.totalEarned = (workingUser.totalEarned || 0) + Math.max(0, applied);
        appliedAmount = applied;
      } catch (err) {
        console.warn('coinsAdjust failed', err);
      }
    }
  } else {
    // negative delta: request server to deduct (server will clamp to >=0)
    try {
      const resp = await fetch('/.netlify/functions/coinsAdjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta, reason: 'quest_deduct', refType: 'unit', refId: unitId }),
      });
      const json = await resp.json();
      const applied = typeof json.applied === 'number' ? json.applied : delta;
      const coins = typeof json.coins === 'number' ? json.coins : workingUser.coins + applied;
      workingUser.coins = coins;
      appliedAmount = applied;
    } catch (err) {
      console.warn('coinsAdjust failed', err);
    }
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
    const solvedIds = user.solvedQuestionIds || [];
    if (solvedIds.includes(questionId) || baseCoins <= 0) {
      return { updatedUser: user, coinsAwarded: 0 };
    }

    const solvedUser: User = {
      ...user,
      solvedQuestionIds: [...solvedIds, questionId],
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
    const completed = user.completedUnits || [];
    const progressUser: User = {
      ...user,
      completedUnits: [...new Set([...completed, unitId])],
    };

    const { user: updatedUser, applied } = await applyQuestCoinsDelta(
      progressUser,
      unitId,
      reward,
      'standard'
    );

    try {
      await fetch('/.netlify/functions/progressSave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, questCoinsEarned: updatedUser.questCoinsEarnedByUnit?.[unitId] || 0, questCompletedCount: 1, bountyCompleted: false }),
      });
    } catch (e) {
      console.warn('progressSave failed', e);
    }

    return { updatedUser, coinsAwarded: applied };
  },

  completeBountyQuest: async (
    user: User,
    unitId: string,
    reward: number
  ): Promise<{ updatedUser: User; coinsAwarded: number }> => {
    const alreadyClaimed = user.bountyPayoutClaimed?.[unitId] ?? false;
    const mastered = user.masteredUnits || [];
    const masteredSet = [...new Set([...mastered, unitId])];

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
      // Request server to adjust coins (award bounty)
      try {
        const resp = await fetch('/.netlify/functions/coinsAdjust', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ delta: reward, reason: 'bounty_reward', refType: 'unit', refId: unitId }),
        });
        const json = await resp.json();
        const applied = typeof json.applied === 'number' ? json.applied : 0;
        const coins = typeof json.coins === 'number' ? json.coins : updatedUser.coins + applied;
        coinsAwarded = applied;
        updatedUser = {
          ...updatedUser,
          coins,
          totalEarned: (updatedUser.totalEarned || 0) + Math.max(0, applied),
          bountyPayoutClaimed: {
            ...(updatedUser.bountyPayoutClaimed || {}),
            [unitId]: true,
          },
        };
      } catch (err) {
        console.warn('coinsAdjust failed for bounty reward', err);
      }
    }

    // persist local cache and progress to server
    await DataService.updateUser(updatedUser);
    try {
      await fetch('/.netlify/functions/progressSave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, questCoinsEarned: updatedUser.questCoinsEarnedByUnit?.[unitId] || 0, questCompletedCount: (updatedUser.completedUnits || []).includes(unitId) ? 1 : 0, bountyCompleted: true }),
      });
    } catch (e) {
      console.warn('progressSave failed', e);
    }
    return { updatedUser, coinsAwarded };
  },

  completePreQuest: async (user: User, unitId: string): Promise<User> => {
    const preCleared = user.preClearedUnits || [];
    const updatedUser: User = {
      ...user,
      preClearedUnits: [...new Set([...preCleared, unitId])],
    };
    await DataService.updateUser(updatedUser);
    try {
      await fetch('/.netlify/functions/progressSave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, questCoinsEarned: updatedUser.questCoinsEarnedByUnit?.[unitId] || 0, questCompletedCount: 0, bountyCompleted: false }),
      });
    } catch (e) {
      console.warn('progressSave failed', e);
    }
    return updatedUser;
  },

  startBountyAttempt: async (user: User, unitId: string, entryFee: number): Promise<User> => {
    if (entryFee <= 0) {
      return user;
    }
    // Ask server to deduct entry fee
    try {
      const resp = await fetch('/.netlify/functions/coinsAdjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta: -Math.abs(entryFee), reason: 'bounty_entry_fee', refType: 'unit', refId: unitId }),
      });
      const json = await resp.json();
      const applied = typeof json.applied === 'number' ? json.applied : 0;
      const coins = typeof json.coins === 'number' ? json.coins : user.coins + applied;
      if (typeof coins === 'number') {
        const updatedUser: User = { ...user, coins };
        await DataService.updateUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.warn('coinsAdjust failed for entry fee', err);
    }
    // Fallback: validate locally
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
