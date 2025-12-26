
import { User } from '../types';
import { DataService } from './apiService';
import { applyQuestRewardCap } from './economyService';

type QuestRunType = 'standard' | 'bounty';

/**
 * Gets API headers with anonymous ID if available.
 * Reads from cookie (set by server) or localStorage (client fallback).
 */
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'mm_anon_id' && value) {
          headers['x-anon-id'] = value;
          return headers;
        }
      }
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mm_anon_id');
      if (stored) {
        headers['x-anon-id'] = stored;
      }
    }
  } catch (e) {
    // ignore
  }
  return headers;
}

/**
 * Processes response headers to store anonymous ID from Set-Cookie.
 */
function processResponseHeaders(response: Response): void {
  try {
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/mm_anon_id=([^;]+)/);
      if (match && match[1] && typeof window !== 'undefined') {
        localStorage.setItem('mm_anon_id', match[1]);
      }
    }
  } catch (e) {
    // ignore
  }
}

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
            headers: getApiHeaders(),
            body: JSON.stringify({ delta: appliedAmount, reason: 'quest_reward', refType: 'unit', refId: unitId }),
          });
          processResponseHeaders(resp);
          if (!resp.ok) {
            console.warn('coinsAdjust failed: non-OK response', resp.status);
            throw new Error(`coinsAdjust failed: ${resp.status}`);
          }
          const json = await resp.json();
          if (!json.ok) {
            console.warn('coinsAdjust failed:', json.error, json.details);
            throw new Error(json.error || 'coinsAdjust failed');
          }
          // Validate response values
          const applied = Number.isFinite(json.applied) ? json.applied : 0;
          const coins = Number.isFinite(json.coins) ? json.coins : (Number.isFinite(workingUser.coins) ? workingUser.coins : 0);
          workingUser.coins = coins;
          const currentTotalEarned = Number.isFinite(workingUser.totalEarned) ? workingUser.totalEarned : 0;
          workingUser.totalEarned = currentTotalEarned + Math.max(0, applied);
          appliedAmount = applied;

          // Warn if dev-fallback detected
          if (json.note && json.note.includes('dev-fallback')) {
            console.warn('coinsAdjust: Dev fallback detected - coins not persisted');
            // Don't update coins if dev-fallback (keep current value)
            workingUser.coins = Number.isFinite(workingUser.coins) ? workingUser.coins : 0;
            appliedAmount = 0;
          }
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
          headers: getApiHeaders(),
          body: JSON.stringify({ delta, reason: 'quest_adjust', refType: 'unit', refId: unitId }),
        });
        processResponseHeaders(resp);
        if (!resp.ok) {
          console.warn('coinsAdjust failed: non-OK response', resp.status);
          throw new Error(`coinsAdjust failed: ${resp.status}`);
        }
        const json = await resp.json();
        if (!json.ok) {
          console.warn('coinsAdjust failed:', json.error, json.details);
          throw new Error(json.error || 'coinsAdjust failed');
        }
        // Validate response values
        const applied = Number.isFinite(json.applied) ? json.applied : 0;
        const coins = Number.isFinite(json.coins) ? json.coins : (Number.isFinite(workingUser.coins) ? workingUser.coins : 0);
        workingUser.coins = coins;
        const currentTotalEarned = Number.isFinite(workingUser.totalEarned) ? workingUser.totalEarned : 0;
        workingUser.totalEarned = currentTotalEarned + Math.max(0, applied);
        appliedAmount = applied;

        // Warn if dev-fallback detected
        if (json.note && json.note.includes('dev-fallback')) {
          console.warn('coinsAdjust: Dev fallback detected - coins not persisted');
          // Don't update coins if dev-fallback (keep current value)
          workingUser.coins = Number.isFinite(workingUser.coins) ? workingUser.coins : 0;
          appliedAmount = 0;
        }
      } catch (err) {
        console.warn('coinsAdjust failed', err);
      }
    }
  } else {
    // negative delta: request server to deduct (server will clamp to >=0)
    try {
      const resp = await fetch('/.netlify/functions/coinsAdjust', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ delta, reason: 'quest_deduct', refType: 'unit', refId: unitId }),
      });
      processResponseHeaders(resp);
      if (!resp.ok) {
        console.warn('coinsAdjust failed: non-OK response', resp.status);
        throw new Error(`coinsAdjust failed: ${resp.status}`);
      }
      const json = await resp.json();
      if (!json.ok) {
        console.warn('coinsAdjust failed:', json.error, json.details);
        throw new Error(json.error || 'coinsAdjust failed');
      }
      // Validate response values
      const applied = Number.isFinite(json.applied) ? json.applied : 0;
      const coins = Number.isFinite(json.coins) ? json.coins : (Number.isFinite(workingUser.coins) ? workingUser.coins : 0);

      // Warn if dev-fallback detected
      if (json.note && json.note.includes('dev-fallback')) {
        console.warn('coinsAdjust: Dev fallback detected - coins not persisted');
        // Don't update coins if dev-fallback (keep current value)
        workingUser.coins = Number.isFinite(workingUser.coins) ? workingUser.coins : 0;
        appliedAmount = 0;
      } else {
        workingUser.coins = coins;
        appliedAmount = applied;
      }
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
    reward: number,
    isPerfectRun: boolean = false,
    percentage: number = 100
  ): Promise<{ updatedUser: User; coinsAwarded: number }> => {
    const completed = user.completedUnits || [];
    const progressUser: User = {
      ...user,
      completedUnits: [...new Set([...completed, unitId])],
    };

    // If perfect run OR ≥80% correct, add to perfectStandardQuizUnits (unlocks bounty)
    if (isPerfectRun || percentage >= 80) {
      const perfectStandard = progressUser.perfectStandardQuizUnits || [];
      if (!perfectStandard.includes(unitId)) {
        progressUser.perfectStandardQuizUnits = [...perfectStandard, unitId];
      }
    }

    const { user: updatedUser, applied } = await applyQuestCoinsDelta(
      progressUser,
      unitId,
      reward,
      'standard'
    );

    try {
      const resp = await fetch('/.netlify/functions/progressSave', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          unitId,
          questCoinsEarned: updatedUser.questCoinsEarnedByUnit?.[unitId] || 0,
          questCompletedCount: 1,
          bountyCompleted: false,
          perfectStandardQuiz: isPerfectRun,
          perfectBounty: false
        }),
      });
      processResponseHeaders(resp);
      if (!resp.ok) {
        console.warn('progressSave failed: non-OK response', resp.status);
      } else {
        const json = await resp.json();
        if (!json.ok) {
          console.warn('progressSave failed:', json.error, json.details);
        } else if (json.note && json.note.includes('dev-fallback')) {
          console.warn('progressSave: Dev fallback detected - progress not persisted');
          // Don't update progress arrays if dev-fallback
          // Keep existing user state
        }
      }
    } catch (e) {
      console.warn('progressSave failed', e);
    }

    return { updatedUser, coinsAwarded: applied };
  },

  completeBountyQuest: async (
    user: User,
    unitId: string,
    reward: number,
    isPerfectRun: boolean = false
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

    // If perfect run, add to perfectBountyUnits
    if (isPerfectRun) {
      const perfectBounty = updatedUser.perfectBountyUnits || [];
      if (!perfectBounty.includes(unitId)) {
        updatedUser.perfectBountyUnits = [...perfectBounty, unitId];
      }
    }

    let coinsAwarded = 0;
    if (!alreadyClaimed && reward > 0) {
      // Request server to adjust coins (award bounty)
      try {
        const resp = await fetch('/.netlify/functions/coinsAdjust', {
          method: 'POST',
          headers: getApiHeaders(),
          body: JSON.stringify({ delta: reward, reason: 'bounty_reward', refType: 'unit', refId: unitId }),
        });
        processResponseHeaders(resp);
        if (!resp.ok) {
          console.warn('coinsAdjust failed: non-OK response', resp.status);
          throw new Error(`coinsAdjust failed: ${resp.status}`);
        }
        const json = await resp.json();
        if (!json.ok) {
          console.warn('coinsAdjust failed:', json.error, json.details);
          throw new Error(json.error || 'coinsAdjust failed');
        }
        // Validate response values
        const applied = Number.isFinite(json.applied) ? json.applied : 0;
        const coins = Number.isFinite(json.coins) ? json.coins : (Number.isFinite(updatedUser.coins) ? updatedUser.coins : 0);
        coinsAwarded = applied;
        const currentTotalEarned = Number.isFinite(updatedUser.totalEarned) ? updatedUser.totalEarned : 0;
        updatedUser = {
          ...updatedUser,
          coins,
          totalEarned: currentTotalEarned + Math.max(0, applied),
          bountyPayoutClaimed: {
            ...(updatedUser.bountyPayoutClaimed || {}),
            [unitId]: true,
          },
        };

        // Warn if dev-fallback detected
        if (json.note && json.note.includes('dev-fallback')) {
          console.warn('coinsAdjust: Dev fallback detected - coins not persisted');
          // Don't update coins if dev-fallback (keep current value)
          updatedUser.coins = Number.isFinite(updatedUser.coins) ? updatedUser.coins : 0;
          coinsAwarded = 0;
        }
      } catch (err) {
        console.warn('coinsAdjust failed for bounty reward', err);
      }
    }

    // persist local cache and progress to server
    await DataService.updateUser(updatedUser);
    try {
      const resp = await fetch('/.netlify/functions/progressSave', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          unitId,
          questCoinsEarned: updatedUser.questCoinsEarnedByUnit?.[unitId] || 0,
          questCompletedCount: (updatedUser.completedUnits || []).includes(unitId) ? 1 : 0,
          bountyCompleted: true,
          perfectStandardQuiz: (updatedUser.perfectStandardQuizUnits || []).includes(unitId),
          perfectBounty: isPerfectRun
        }),
      });
      processResponseHeaders(resp);
      if (!resp.ok) {
        console.warn('progressSave failed: non-OK response', resp.status);
      } else {
        const json = await resp.json();
        if (!json.ok) {
          console.warn('progressSave failed:', json.error, json.details);
        } else if (json.note && json.note.includes('dev-fallback')) {
          console.warn('progressSave: Dev fallback detected - progress not persisted');
          // Don't update progress arrays if dev-fallback
          // Keep existing user state
        }
      }
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
      const resp = await fetch('/.netlify/functions/progressSave', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          unitId,
          questCoinsEarned: updatedUser.questCoinsEarnedByUnit?.[unitId] || 0,
          questCompletedCount: 0,
          bountyCompleted: false,
          perfectStandardQuiz: (updatedUser.perfectStandardQuizUnits || []).includes(unitId),
          perfectBounty: (updatedUser.perfectBountyUnits || []).includes(unitId)
        }),
      });
      processResponseHeaders(resp);
      if (!resp.ok) {
        console.warn('progressSave failed: non-OK response', resp.status);
      } else {
        const json = await resp.json();
        if (!json.ok) {
          console.warn('progressSave failed:', json.error, json.details);
        } else if (json.note && json.note.includes('dev-fallback')) {
          console.warn('progressSave: Dev fallback detected - progress not persisted');
          // Don't update progress arrays if dev-fallback
          // Keep existing user state
        }
      }
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
        headers: getApiHeaders(),
        body: JSON.stringify({ delta: -Math.abs(entryFee), reason: 'bounty_entry_fee', refType: 'unit', refId: unitId }),
      });
      processResponseHeaders(resp);
      const json = await resp.json();
      const applied = Number.isFinite(json.applied) ? json.applied : 0;
      const currentCoins = Number.isFinite(user.coins) ? user.coins : 0;
      const coins = Number.isFinite(json.coins) ? json.coins : currentCoins + applied;
      if (Number.isFinite(coins)) {
        const updatedUser: User = { ...user, coins };
        await DataService.updateUser(updatedUser);
        return updatedUser;
      }
    } catch (err) {
      console.warn('coinsAdjust failed for entry fee', err);
    }
    // Fallback: validate locally
    const currentCoins = Number.isFinite(user.coins) ? user.coins : 0;
    if (currentCoins < entryFee) {
      throw new Error('INSUFFICIENT_COINS');
    }
    const updatedUser: User = {
      ...user,
      coins: currentCoins - entryFee,
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
