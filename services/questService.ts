
import { User } from '../types';
import { DataService } from './apiService';

export const QuestService = {
  awardCoinsForQuestion: async (user: User, questionId: string, baseCoins: number): Promise<{ updatedUser: User, coinsAwarded: number }> => {
    if (user.solvedQuestionIds.includes(questionId) || baseCoins <= 0) {
      return { updatedUser: user, coinsAwarded: 0 };
    }

    const updatedUser: User = {
      ...user,
      coins: user.coins + baseCoins,
      totalEarned: user.totalEarned + baseCoins,
      solvedQuestionIds: [...user.solvedQuestionIds, questionId],
    };
    
    await DataService.updateUser(updatedUser);
    return { updatedUser, coinsAwarded: baseCoins };
  },

  completeStandardQuest: async (user: User, unitId: string): Promise<User> => {
      const updatedUser: User = {
          ...user,
          completedUnits: [...new Set([...user.completedUnits, unitId])]
      };
      await DataService.updateUser(updatedUser);
      return updatedUser;
  },

  completeBountyQuest: async (user: User, unitId: string): Promise<User> => {
      const updatedUser: User = {
          ...user,
          masteredUnits: [...new Set([...user.masteredUnits, unitId])]
      };
      await DataService.updateUser(updatedUser);
      return updatedUser;
  },

  completePreQuest: async (user: User, unitId: string): Promise<User> => {
    const updatedUser: User = {
        ...user,
        preClearedUnits: [...new Set([...user.preClearedUnits, unitId])]
    };
    await DataService.updateUser(updatedUser);
    return updatedUser;
}
};
