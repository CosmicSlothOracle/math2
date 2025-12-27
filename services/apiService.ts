import { User, ChatMessage } from '../types';

/**
 * CRITICAL: This file now uses server as source of truth.
 * LocalStorage is ONLY used as a cache. All mutations go through Netlify functions.
 */

const db = {
  get: (key: string) => JSON.parse(localStorage.getItem(key) || 'null'),
  set: (key: string, val: any) => localStorage.setItem(key, JSON.stringify(val)),
};

// Helper to get API headers with anon ID
function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  try {
    // Try cookie first
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'mm_anon_id' && value) {
        headers['x-anon-id'] = value;
        break;
      }
    }

    // Fallback to localStorage
    if (!headers['x-anon-id']) {
      const stored = localStorage.getItem('mm_anon_id');
      if (stored) headers['x-anon-id'] = stored;
    }
  } catch (e) {
    console.warn('[getApiHeaders] Error reading anon ID:', e);
  }

  return headers;
}

// Helper to persist anon ID from response
function persistAnonId(resp: Response): void {
  try {
    const setCookie = resp.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/mm_anon_id=([^;]+)/);
      if (match && match[1]) {
        localStorage.setItem('mm_anon_id', match[1]);
      }
    }
  } catch (e) {
    console.warn('[persistAnonId] Error persisting anon ID:', e);
  }
}

const ensureArray = (value: any, fallback: string[] = []): string[] => (Array.isArray(value) ? value : fallback);

// Helper to normalize user object from server
function normalizeUser(serverUser: any): User {
  const unlockedRaw = ensureArray(
    serverUser.unlockedItems,
    ensureArray(serverUser.unlocked_items, ['av_1', 'calc_default'])
  );

  return {
    ...serverUser,
    coins: Number.isFinite(serverUser.coins) ? serverUser.coins : 250,
    totalEarned: Number.isFinite(serverUser.totalEarned) ? serverUser.totalEarned : 250,
    xp: Number.isFinite(serverUser.xp) ? serverUser.xp : 0,
    completedUnits: ensureArray(serverUser.completedUnits, ensureArray(serverUser.completed_units, [])),
    masteredUnits: ensureArray(serverUser.masteredUnits, ensureArray(serverUser.mastered_units, [])),
    preClearedUnits: ensureArray(serverUser.preClearedUnits, ensureArray(serverUser.pre_cleared_units, [])),
    perfectStandardQuizUnits: ensureArray(
      serverUser.perfectStandardQuizUnits,
      ensureArray(serverUser.perfect_standard_quiz_units, [])
    ),
    perfectBountyUnits: ensureArray(
      serverUser.perfectBountyUnits,
      ensureArray(serverUser.perfect_bounty_units, [])
    ),
    unlockedItems: [...new Set(unlockedRaw)],
    activeEffects: ensureArray(serverUser.activeEffects, ensureArray(serverUser.active_effects, [])),
    solvedQuestionIds: Array.isArray(serverUser.solvedQuestionIds) ? serverUser.solvedQuestionIds : [],
    questCoinsEarnedByUnit: serverUser.questCoinsEarnedByUnit || {},
    bountyPayoutClaimed: serverUser.bountyPayoutClaimed || {},
    username: serverUser.username || serverUser.display_name || 'User',
    avatar: serverUser.avatar || '👤',
    calculatorSkin: serverUser.calculatorSkin || serverUser.calculator_skin || 'default',
  };
}

export const AuthService = {
  /**
   * Login now calls /me endpoint to get or create user on server.
   * Username is stored as display_name in the backend.
   */
  async login(username: string): Promise<User> {
    try {
      console.log('[AuthService.login] Calling /me with username:', username);
      const headers = getApiHeaders();

      // Call /me endpoint which will create user if needed
      const resp = await fetch('/.netlify/functions/me', {
        method: 'GET',
        headers,
      });

      persistAnonId(resp);

      if (!resp.ok) {
        throw new Error(`/me failed: ${resp.status}`);
      }

      const json = await resp.json();

      // Check if dev fallback
      if (json.note && json.note.includes('dev-fallback')) {
        console.warn('[AuthService.login] Dev fallback - creating local user');
        // In dev mode without backend, create local user
        const localUser: User = {
          id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          username,
          avatar: '👤',
          coins: 2000, // Dev mode coins
          totalEarned: 2000,
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
        db.set('mm_current_user', localUser);
        return localUser;
      }

      if (!json.user) {
        throw new Error('No user in /me response');
      }

      // Normalize and cache user
      const user = normalizeUser(json.user);

      // Update username/display_name if needed
      if (user.username !== username) {
        user.username = username;
        // TODO: Optionally call a /setDisplayName endpoint
      }

      db.set('mm_current_user', user);
      if (json.progress) {
        db.set('mm_progress', json.progress);
      }

      console.log('[AuthService.login] Success:', { userId: user.id, coins: user.coins });
      return user;
    } catch (err) {
      console.error('[AuthService.login] Error:', err);

      // Fallback to local user in case of network failure
      const localUser: User = {
        id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
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
      db.set('mm_current_user', localUser);
      return localUser;
    }
  },

  getCurrentUser(): User | null {
    const user = db.get('mm_current_user');
    if (user) {
      // Ensure all numeric fields are valid numbers
      if (!Number.isFinite(user.coins)) user.coins = 250;
      if (!Number.isFinite(user.totalEarned)) user.totalEarned = 250;
      if (!Number.isFinite(user.xp)) user.xp = 0;
      if (!Array.isArray(user.unlockedItems)) user.unlockedItems = ['av_1', 'calc_default'];
    }
    return user;
  },
};

export const DataService = {
  /**
   * DEPRECATED: Use specific API endpoints instead.
   * This is kept for backward compatibility but should not be used for coins/progress.
   */
  async updateUser(user: User): Promise<void> {
    db.set('mm_current_user', user);
    try {
      const resp = await fetch('/.netlify/functions/updateUser', {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({
          avatar: user.avatar,
          calculatorSkin: user.calculatorSkin,
          activeEffects: user.activeEffects,
          unlockedItems: user.unlockedItems,
          completedUnits: user.completedUnits,
          masteredUnits: user.masteredUnits,
          preClearedUnits: user.preClearedUnits,
          perfectStandardQuizUnits: user.perfectStandardQuizUnits,
          perfectBountyUnits: user.perfectBountyUnits,
        }),
      });

      persistAnonId(resp);

      if (!resp.ok) {
        const text = await resp.text();
        console.warn('[DataService.updateUser] Server error:', resp.status, text);
        return;
      }

      const json = await resp.json();
      if (json.note && json.note.includes('dev-fallback')) {
        console.warn('[DataService.updateUser] Dev fallback - user not persisted');
        return;
      }

      if (json.user) {
        const normalized = normalizeUser(json.user);
        db.set('mm_current_user', normalized);
      }
    } catch (err) {
      console.warn('[DataService.updateUser] Exception:', err);
    }
  },
};

export const SocialService = {
  async getLeaderboard(): Promise<User[]> {
    // Leaderboard is local-only for now
    return (db.get('mm_users') || []).sort((a: User, b: User) => b.xp - a.xp);
  },

  async getChatMessages(channelId: string = 'class:global', since?: number): Promise<ChatMessage[]> {
    try {
      const params = new URLSearchParams();
      params.set('channelId', channelId);
      if (since) params.set('since', String(since));

      const headers = getApiHeaders();
      const resp = await fetch(`/.netlify/functions/chatPoll?${params.toString()}`, { headers });

      persistAnonId(resp);

      if (!resp.ok) throw new Error('non-ok');
      const json = await resp.json();

      if (json && Array.isArray(json.messages)) {
        return json.messages.map((m: any) => ({
          id: m.id,
          userId: m.sender_id || m.userId || 'unknown',
          username: m.username || 'Anonym',
          text: m.text,
          timestamp: m.created_at ? new Date(m.created_at).valueOf() : Date.now(),
          avatar: m.avatar || '👤',
        })) as ChatMessage[];
      }
    } catch (err) {
      console.warn('[getChatMessages] Error:', err);
      // Fallback to localStorage chat
      const fallback = db.get('mm_chat') || [];
      return fallback;
    }
    return [];
  },

  async sendMessage(user: User, text: string, channelId: string = 'class:global'): Promise<void> {
    try {
      const headers = getApiHeaders();
      const resp = await fetch('/.netlify/functions/chatSend', {
        method: 'POST',
        headers,
        body: JSON.stringify({ text, channelId, username: user.username, avatar: user.avatar }),
      });

      persistAnonId(resp);

      if (!resp.ok) {
        console.warn('chatSend: non-OK response', resp.status, resp.statusText);
        throw new Error(`send failed: ${resp.status}`);
      }

      const contentType = resp.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await resp.json();
        if (json.note && json.note.includes('dev-fallback')) {
          console.warn('chatSend: Dev fallback detected - message not persisted');
          throw new Error('Message not persisted - backend offline');
        }
        if (json.ok === false) {
          console.error('chatSend: Function returned ok: false', json.error);
          throw new Error(json.error || 'Message send failed');
        }
      }
    } catch (err) {
      console.warn('[sendMessage] Error:', err);
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

/**
 * Bootstrap user from server on app load.
 * This is the SINGLE SOURCE OF TRUTH for user state.
 * ALWAYS call this on app boot and after any major state change.
 */
export async function bootstrapServerUser(): Promise<any | null> {
  try {
    console.log('[bootstrapServerUser] Fetching user from server...');
    const headers = getApiHeaders();
    const resp = await fetch('/.netlify/functions/me', { headers });

    persistAnonId(resp);

    if (!resp.ok) {
      console.warn('[bootstrapServerUser] non-OK response', resp.status);
      return null;
    }

    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('[bootstrapServerUser] Response is not JSON, got:', contentType);
      const text = await resp.text();
      console.warn('Response text (first 200 chars):', text.substring(0, 200));
      return null;
    }

    const json = await resp.json();

    // If server returned dev fallback, keep existing user if any
    if (json && json.note && (json.note.includes('dev-fallback') || json.note.includes('dev'))) {
      console.log('[bootstrapServerUser] Server returned dev fallback');
      return null;
    }

    if (json && json.user) {
      // Server is source of truth - normalize and cache
      const user = normalizeUser(json.user);

      db.set('mm_current_user', user);
      if (json.progress) {
        db.set('mm_progress', json.progress);
      }

      console.log('[bootstrapServerUser] Success:', {
        userId: user.id,
        coins: user.coins,
        progressCount: json.progress ? json.progress.length : 0
      });

      return json;
    }

    return json;
  } catch (err) {
    console.warn('[bootstrapServerUser] Error:', err);
    return null;
  }
}

/**
 * Refresh user state from server.
 * Call this after any operation that modifies server state (coins, progress, purchases).
 */
export async function refreshUserFromServer(): Promise<User | null> {
  const result = await bootstrapServerUser();
  if (result && result.user) {
    return result.user;
  }
  return null;
}
