/**
 * Server sync utilities - wrappers around Netlify functions
 * These ensure all state mutations go through the server.
 */

import { refreshUserFromServer } from './apiService';

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

/**
 * Adjust coins on server and refresh user state.
 *
 * @param delta - Amount to add/subtract (negative for deductions)
 * @param reason - Human-readable reason for the transaction
 * @param refType - Type of reference (e.g., 'quest', 'shop_item', 'bounty')
 * @param refId - ID of the reference entity
 * @returns New coin balance or null on error
 */
export async function adjustCoins(
  delta: number,
  reason: string,
  refType?: string,
  refId?: string
): Promise<number | null> {
  try {
    console.log('[adjustCoins]', { delta, reason, refType, refId });

    const headers = getApiHeaders();
    const resp = await fetch('/.netlify/functions/coinsAdjust', {
      method: 'POST',
      headers,
      body: JSON.stringify({ delta, reason, refType, refId }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[adjustCoins] Server error:', resp.status, text);
      return null;
    }

    const json = await resp.json();

    if (json.note && json.note.includes('dev-fallback')) {
      console.warn('[adjustCoins] Dev fallback - changes not persisted');
      return json.coins || null;
    }

    if (!json.ok) {
      console.error('[adjustCoins] Function returned error:', json.error);
      return null;
    }

    // Refresh user from server to get updated state
    await refreshUserFromServer();

    console.log('[adjustCoins] Success:', { newCoins: json.coins, applied: json.applied });
    return json.coins;
  } catch (err) {
    console.error('[adjustCoins] Exception:', err);
    return null;
  }
}

/**
 * Save quest/bounty progress to server.
 *
 * @param unitId - The learning unit ID
 * @param data - Progress data to save
 * @returns Success boolean
 */
export async function saveProgress(
  unitId: string,
  data: {
    questCoinsEarned?: number;
    questCompletedCount?: number;
    bountyCompleted?: boolean;
    perfectStandardQuiz?: boolean;
    perfectBounty?: boolean;
  }
): Promise<boolean> {
  try {
    console.log('[saveProgress]', { unitId, data });

    const headers = getApiHeaders();
    const resp = await fetch('/.netlify/functions/progressSave', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        unitId,
        questCoinsEarned: data.questCoinsEarned || 0,
        questCompletedCount: data.questCompletedCount || 0,
        bountyCompleted: data.bountyCompleted || false,
        perfectStandardQuiz: data.perfectStandardQuiz || false,
        perfectBounty: data.perfectBounty || false,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[saveProgress] Server error:', resp.status, text);
      return false;
    }

    const json = await resp.json();

    if (json.note && json.note.includes('dev-fallback')) {
      console.warn('[saveProgress] Dev fallback - changes not persisted');
      return true; // Don't block UX in dev mode
    }

    if (!json.ok) {
      console.error('[saveProgress] Function returned error:', json.error);
      return false;
    }

    // Refresh user from server to get updated arrays
    await refreshUserFromServer();

    console.log('[saveProgress] Success:', json.saved);
    return true;
  } catch (err) {
    console.error('[saveProgress] Exception:', err);
    return false;
  }
}

/**
 * Purchase item from shop.
 *
 * @param itemId - Shop item ID
 * @param itemCost - Cost in coins
 * @returns New coin balance and unlocked items, or null on error
 */
export async function purchaseShopItem(
  itemId: string,
  itemCost: number
): Promise<{ coins: number; unlockedItems: string[] } | null> {
  try {
    console.log('[purchaseShopItem]', { itemId, itemCost });

    const headers = getApiHeaders();
    const resp = await fetch('/.netlify/functions/shopBuy', {
      method: 'POST',
      headers,
      body: JSON.stringify({ itemId, itemCost }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error('[purchaseShopItem] Server error:', resp.status, text);
      return null;
    }

    const json = await resp.json();

    if (json.note && json.note.includes('dev-fallback')) {
      console.warn('[purchaseShopItem] Dev fallback - purchase not persisted');
      return { coins: json.coins || 0, unlockedItems: json.unlockedItems || [] };
    }

    if (!json.ok) {
      console.error('[purchaseShopItem] Function returned error:', json.error);
      return null;
    }

    // Refresh user from server to get updated state
    await refreshUserFromServer();

    console.log('[purchaseShopItem] Success:', { coins: json.coins, unlockedItems: json.unlockedItems });
    return { coins: json.coins, unlockedItems: json.unlockedItems };
  } catch (err) {
    console.error('[purchaseShopItem] Exception:', err);
    return null;
  }
}

