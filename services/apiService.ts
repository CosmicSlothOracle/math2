
import { User, ChatMessage } from '../types';

const db = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val)),
};

export const AuthService = {
  async login(username: string): Promise<User> {
    let users = db.get('mm_users') || [];
    let user = users.find((u: User) => u.username === username);
    if (!user) {
      user = { id: Math.random().toString(36).substr(2, 9), username, avatar: '👤', coins: 250, totalEarned: 250, completedUnits: [], masteredUnits: [], preClearedUnits: [], unlockedItems: ['av_1', 'calc_default'], activeEffects: [], calculatorSkin: 'default', xp: 0, solvedQuestionIds: [] };
      users.push(user); db.set('mm_users', users);
    }
    db.set('mm_current_user', user); return user;
  },
  getCurrentUser(): User | null { return db.get('mm_current_user'); }
};

export const DataService = {
  async updateUser(user: User): Promise<void> {
    let users = db.get('mm_users') || [];
    const idx = users.findIndex((u: User) => u.id === user.id);
    if (idx !== -1) { users[idx] = user; db.set('mm_users', users); db.set('mm_current_user', user); }
  }
};

export const SocialService = {
  async getLeaderboard(): Promise<User[]> {
    return (db.get('mm_users') || []).sort((a: any, b: any) => b.xp - a.xp);
  },
  async getChatMessages(): Promise<ChatMessage[]> {
    return db.get('mm_chat') || [];
  },
  async sendMessage(user: User, text: string): Promise<void> {
    let chat = db.get('mm_chat') || [];
    chat.push({ id: Date.now().toString(), userId: user.id, username: user.username, text, timestamp: Date.now(), avatar: user.avatar });
    db.set('mm_chat', chat.slice(-50));
  }
};
