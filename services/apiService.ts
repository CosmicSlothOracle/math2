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
        perfectStandardQuizUnits: [],
        perfectBountyUnits: [],
        unlockedItems: ['av_1', 'calc_default'],
        activeEffects: [],
        calculatorSkin: 'default',
        xp: 0,
        solvedQuestionIds: [],
        questCoinsEarnedByUnit: {},
        bountyPayoutClaimed: {},
      };
      users.push(user);
    }

    if (!user.preClearedUnits) user.preClearedUnits = [];
    if (!user.perfectStandardQuizUnits) user.perfectStandardQuizUnits = [];
    if (!user.perfectBountyUnits) user.perfectBountyUnits = [];

    db.set('mm_users', users);
    db.set('mm_current_user', user);
    return user;
  },
  getCurrentUser(): User | null {
    return db.get('mm_current_user');
  },
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
  },
};

export const SocialService = {
  async getLeaderboard(): Promise<User[]> {
    return (db.get('mm_users') || []).sort((a: User, b: User) => b.xp - a.xp);
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
          timestamp: new Date(m.created_at).valueOf
            ? new Date(m.created_at).valueOf()
            : m.created_at || Date.now(),
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
      if (!resp.ok) {
        console.warn('chatSend: non-OK response', resp.status, resp.statusText);
        throw new Error(`send failed: ${resp.status}`);
      }
      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        await resp.json();
      }
    } catch (err) {
      // fallback to local storage
      let chat = db.get('mm_chat') || [];
      chat.push({
        id: Date.now().toString(),
        userId: user.id,
        username: user.username,
        text,
        timestamp: Date.now(),
        avatar: user.avatar,
      });
      db.set('mm_chat', chat.slice(-50));
    }
  },
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
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('bootstrapServerUser: Response is not JSON, got:', contentType);
      const text = await resp.text();
      console.warn('Response text (first 200 chars):', text.substring(0, 200));
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
        const mergedUser = {
          ...existingUser,
          ...json.user,
          coins: Math.max(existingUser.coins || 0, json.user.coins || 0),
          totalEarned: Math.max(existingUser.totalEarned || 0, json.user.totalEarned || 0),
          completedUnits: existingUser.completedUnits || json.user.completedUnits || [],
          masteredUnits: existingUser.masteredUnits || json.user.masteredUnits || [],
          preClearedUnits: existingUser.preClearedUnits || json.user.preClearedUnits || [],
          perfectStandardQuizUnits:
            existingUser.perfectStandardQuizUnits || json.user.perfectStandardQuizUnits || [],
          perfectBountyUnits:
            existingUser.perfectBountyUnits || json.user.perfectBountyUnits || [],
          solvedQuestionIds: existingUser.solvedQuestionIds || json.user.solvedQuestionIds || [],
          questCoinsEarnedByUnit: existingUser.questCoinsEarnedByUnit || json.user.questCoinsEarnedByUnit || {},
          bountyPayoutClaimed: existingUser.bountyPayoutClaimed || json.user.bountyPayoutClaimed || {},
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
        // New user from server - ensure all arrays are initialized
        const newUser = {
          ...json.user,
          completedUnits: json.user.completedUnits || [],
          masteredUnits: json.user.masteredUnits || [],
          preClearedUnits: json.user.preClearedUnits || [],
          perfectStandardQuizUnits: json.user.perfectStandardQuizUnits || [],
          perfectBountyUnits: json.user.perfectBountyUnits || [],
          solvedQuestionIds: json.user.solvedQuestionIds || [],
          questCoinsEarnedByUnit: json.user.questCoinsEarnedByUnit || {},
          bountyPayoutClaimed: json.user.bountyPayoutClaimed || {},
        };
        if (idx !== -1) {
          users[idx] = newUser;
        } else {
          users.push(newUser);
        }
        db.set('mm_users', users);
        db.set('mm_current_user', newUser);
      }

      if (json.progress) db.set('mm_progress', json.progress);
      return json;
    }
    return json;
  } catch (err) {
    console.warn('bootstrapServerUser failed', err);
    return null;
  }
}