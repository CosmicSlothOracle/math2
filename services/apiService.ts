
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
      user = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        avatar: '👤',
        coins: 250,
        totalEarned: 250,
        completedUnits: [],
        masteredUnits: [],
        preClearedUnits: [],
        unlockedItems: ['av_1', 'calc_default'],
        activeEffects: [],
        calculatorSkin: 'default',
        xp: 0,
        solvedQuestionIds: [],
        questCoinsEarnedByUnit: {},
        bountyPayoutClaimed: {},
      };
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
  async getChatMessages(channelId: string = 'class:global', since?: number): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams();
      params.set('channelId', channelId);
      if (since) params.set('since', String(since));
      const resp = await fetch(`/.netlify/functions/chatPoll?${params.toString()}`);
      if (!resp.ok) throw new Error('non-ok');
      const json = await resp.json();
      if (json && Array.isArray(json.messages)) {
        return json.messages.map((m: any) => ({
          id: m.id,
          userId: m.sender_id || m.userId,
          username: m.username || m.username,
          text: m.text,
          timestamp: new Date(m.created_at).valueOf ? new Date(m.created_at).valueOf() : (m.created_at || Date.now()),
          avatar: m.avatar || '👤',
        })) as ChatMessage[];
      }
    } catch (err) {
      // fallback to localStorage chat
      return db.get('mm_chat') || [];
    }
    return [];
  },
  async sendMessage(user: User, text: string, channelId: string = 'class:global'): Promise<void> {
    try {
      const resp = await fetch('/.netlify/functions/chatSend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, channelId, username: user.username }),
      });
      if (!resp.ok) throw new Error('send failed');
      // optionally process returned message
      const json = await resp.json();
      if (json && json.message) return;
    } catch (err) {
      // fallback to local storage
      let chat = db.get('mm_chat') || [];
      chat.push({ id: Date.now().toString(), userId: user.id, username: user.username, text, timestamp: Date.now(), avatar: user.avatar });
      db.set('mm_chat', chat.slice(-50));
    }
  }
};

// Attempt to bootstrap user from Netlify Functions backend (/me).
// In dev (no SUPABASE env or no Authorization) the function returns a dev fallback.
export async function bootstrapServerUser(): Promise<any | null> {
  try {
    const resp = await fetch('/.netlify/functions/me');
    if (!resp.ok) {
      console.warn('bootstrapServerUser: non-OK response', resp.status);
      return null;
    }
    const json = await resp.json();
    if (json && json.user) {
      let users = db.get('mm_users') || [];
      const idx = users.findIndex((u: any) => u.id === json.user.id);
      if (idx !== -1) {
        users[idx] = json.user;
      } else {
        users.push(json.user);
      }
      db.set('mm_users', users);
      db.set('mm_current_user', json.user);
      return json;
    }
    return json;
  } catch (err) {
    console.warn('bootstrapServerUser failed', err);
    return null;
  }
}
