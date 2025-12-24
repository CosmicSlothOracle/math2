
import { User, ChatMessage, LogEntry, BattleRequest } from '../types';

const DELAY = 100;

const db = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val)),
};

// Chat Initialisierung mit Seed-Nachrichten
if (!db.get('mm_chat')) {
  const now = Date.now();
  db.set('mm_chat', [
    { id: '1', userId: 'bot1', username: 'Lukas_9b', text: 'Hey, wer traut sich ein Battle in "Ähnlichkeit" zu? 📐', timestamp: now - 3600000, avatar: '🦉', type: 'chat' },
    { id: '2', userId: 'bot2', username: 'Sarah.Math', text: 'Ich habe gerade die Bounty für "Körper & Oberflächen" gemeistert! 🔥', timestamp: now - 7200000, avatar: '🥷', type: 'chat' },
    { id: '3', userId: 'bot3', username: 'MathePro_X', text: 'Tipp: Bei Winkel-Aufgaben immer an Nebenwinkel denken (180° Summe)! 💡', timestamp: now - 10800000, avatar: '💎', type: 'chat' },
    { id: '4', userId: 'bot1', username: 'Lukas_9b', text: 'Wer kann mir bei der Flächenberechnung helfen? 🤔', timestamp: now - 14400000, avatar: '🦉', type: 'chat' }
  ]);
}

export const AuthService = {
  async login(username: string): Promise<User> {
    await new Promise(r => setTimeout(r, DELAY));
    let users = db.get('mm_users') || [];
    let user = users.find((u: User) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        avatar: '👤',
        coins: 250,
        totalEarned: 250,
        completedUnits: [],
        masteredUnits: [],
        // Added missing property
        preClearedUnits: [],
        unlockedItems: ['av_1', 'calc_default'],
        activeEffects: [],
        calculatorSkin: 'default',
        xp: 0,
        solvedQuestionIds: [], // Initialisierung für Anti-Farming
      };
      users.push(user);
      db.set('mm_users', users);
    }
    // Migration für bestehende User
    if (!user.masteredUnits) user.masteredUnits = [];
    // Added migration for missing preClearedUnits
    if (!user.preClearedUnits) user.preClearedUnits = [];
    if (!user.calculatorSkin) user.calculatorSkin = 'default';
    if (!user.unlockedItems.includes('calc_default')) user.unlockedItems.push('calc_default');
    if (!user.solvedQuestionIds) user.solvedQuestionIds = []; // Migration für Anti-Farming

    db.set('mm_current_user', user);
    return user;
  },

  getCurrentUser(): User | null {
    const user = db.get('mm_current_user');
    if (user) {
      // Ensure all numeric fields are valid numbers
      // New users should start with 250 coins, not 0
      if (!Number.isFinite(user.coins)) user.coins = 250;
      if (!Number.isFinite(user.totalEarned)) user.totalEarned = 250;
      if (!Number.isFinite(user.xp)) user.xp = 0;
    }
    return user;
  }
};

export const DataService = {
  async updateUser(user: User): Promise<void> {
    let users = db.get('mm_users') || [];
    const idx = users.findIndex((u: User) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      db.set('mm_users', users);
      db.set('mm_current_user', user);
    }
  }
};

export const SocialService = {
  async getLeaderboard(): Promise<User[]> {
    let users = db.get('mm_users') || [];
    const bots: User[] = [
      // Added missing preClearedUnits property to bot objects
      { id: 'bot1', username: 'Lukas_9b', xp: 450, avatar: '🦉', coins: 1000, totalEarned: 2000, completedUnits: [], masteredUnits: [], preClearedUnits: [], unlockedItems: [], activeEffects: [], calculatorSkin: 'default', solvedQuestionIds: [] },
      { id: 'bot2', username: 'Sarah.Math', xp: 820, avatar: '🥷', coins: 1500, totalEarned: 3000, completedUnits: [], masteredUnits: [], preClearedUnits: [], unlockedItems: [], activeEffects: [], calculatorSkin: 'neon', solvedQuestionIds: [] },
      { id: 'bot3', username: 'MathePro_X', xp: 1250, avatar: '💎', coins: 5000, totalEarned: 10000, completedUnits: [], masteredUnits: [], preClearedUnits: [], unlockedItems: [], activeEffects: [], calculatorSkin: 'chaos', solvedQuestionIds: [] }
    ];
    const all = [...users, ...bots];
    return all.sort((a, b) => b.xp - a.xp).slice(0, 10); // Top 10
  },

  async getChatMessages(): Promise<ChatMessage[]> {
    return db.get('mm_chat') || [];
  },

  async sendMessage(user: User, text: string, type: 'chat' | 'system' = 'chat'): Promise<void> {
    let chat = await this.getChatMessages();
    chat.push({
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      text,
      timestamp: Date.now(),
      type
    });
    db.set('mm_chat', chat.slice(-50));
  },

  async broadcastEvent(username: string, event: string) {
    // Diese Funktion dient als "Event-Tracker" für das Backend
    console.log(`[EVENT]: ${username} ${event}`);
    await this.sendMessage({ id: 'system', username: 'SYSTEM', avatar: '📢' } as User, `${username} ${event}`, 'system');
  }
};

// Attempt to bootstrap user from Netlify Functions backend (/me).
// Only updates if server has real data (not dev fallback) and preserves existing user data.
export async function bootstrapServerUser(): Promise<any | null> {
  try {
    const existingUser = AuthService.getCurrentUser();

    const resp = await fetch('/.netlify/functions/me');
    if (!resp.ok) {
      console.warn('bootstrapServerUser: non-OK response', resp.status);
      return null;
    }
    const json = await resp.json();

    // If server returned dev fallback, don't overwrite existing user
    if (json && json.note && (json.note.includes('dev-fallback') || json.note.includes('dev'))) {
      console.log('[Bootstrap] Server returned dev fallback, preserving existing user');
      return null; // Don't overwrite
    }

    if (json && json.user) {
      let users = db.get('mm_users') || [];
      const idx = users.findIndex((u: any) => u.id === json.user.id);

      // If we have an existing user, merge server data intelligently
      if (existingUser && existingUser.id === json.user.id) {
        // Merge: keep local coins if they're higher (user might have earned more)
        // but update other fields from server
        // Preserve existing coins or default to 250 for new users
        const localCoins = Number.isFinite(existingUser.coins) ? existingUser.coins : 250;
        const serverCoins = Number.isFinite(json.user.coins) ? json.user.coins : 250;
        const localTotalEarned = Number.isFinite(existingUser.totalEarned) ? existingUser.totalEarned : 0;
        const serverTotalEarned = Number.isFinite(json.user.totalEarned) ? json.user.totalEarned : 0;
        const serverXp = Number.isFinite(json.user.xp) ? json.user.xp : 0;
        const mergedUser = {
          ...existingUser,
          ...json.user,
          coins: Math.max(localCoins, serverCoins), // Keep higher coin count
          totalEarned: Math.max(localTotalEarned, serverTotalEarned),
          xp: serverXp,
          // Preserve local arrays that might have more data
          completedUnits: existingUser.completedUnits || json.user.completedUnits || [],
          masteredUnits: existingUser.masteredUnits || json.user.masteredUnits || [],
          preClearedUnits: existingUser.preClearedUnits || json.user.preClearedUnits || [],
        };

        if (idx !== -1) {
          users[idx] = mergedUser;
        } else {
          users.push(mergedUser);
        }
        db.set('mm_users', users);
        db.set('mm_current_user', mergedUser);
        return { ...json, user: mergedUser };
      } else {
        // New user from server - ensure all numeric fields are valid
        // New users should start with 250 coins, not 0
        const newUser = {
          ...json.user,
          coins: Number.isFinite(json.user.coins) ? json.user.coins : 250,
          totalEarned: Number.isFinite(json.user.totalEarned) ? json.user.totalEarned : 250,
          xp: Number.isFinite(json.user.xp) ? json.user.xp : 0,
        };
        if (idx !== -1) {
          users[idx] = newUser;
        } else {
          users.push(newUser);
        }
        db.set('mm_users', users);
        db.set('mm_current_user', newUser);
      }

      // persist progress locally for backward compatibility
      if (json.progress) db.set('mm_progress', json.progress);
      return json;
    }
    return json;
  } catch (err) {
    console.warn('bootstrapServerUser failed', err);
    return null;
  }
}
