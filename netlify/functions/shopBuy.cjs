const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };

  try {
    const userId = getUserIdFromEvent(event);
    const supabase = createSupabaseClient();
    const body = event.body ? JSON.parse(event.body) : {};
    const itemId = body.itemId || null;
    const itemCost = Number(body.itemCost || 0);

    console.log('[shopBuy]', { userId, itemId, itemCost, hasSupabase: !!supabase });

    if (!itemId) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'MISSING_ITEM_ID', userId }) };
    }

    if (!Number.isFinite(itemCost) || itemCost < 0 || itemCost > 100000) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'INVALID_COST', userId }) };
    }

    if (!supabase) {
      // Dev fallback: return consistent shape but mark as fallback
      console.warn('[shopBuy] Dev fallback - Supabase not available');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          coins: 2000 - itemCost,
          applied: -itemCost,
          unlockedItems: [itemId],
          userId,
          note: 'dev-fallback',
          warning: 'Purchase not persisted - Supabase not configured'
        })
      };
    }

    // Fetch current user data
    const { data: userRows, error: fetchErr } = await supabase
      .from('users')
      .select('coins, unlocked_items')
      .eq('id', userId)
      .limit(1);

    if (fetchErr) {
      console.error('[shopBuy] Fetch error:', fetchErr);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'USER_FETCH_FAILED', details: fetchErr.message, userId }) };
    }

    if (!userRows || userRows.length === 0) {
      return { statusCode: 404, headers, body: JSON.stringify({ ok: false, error: 'USER_NOT_FOUND', userId }) };
    }

    const user = userRows[0];
    const currentCoins = typeof user.coins === 'number' ? user.coins : 0;
    const currentUnlockedItems = Array.isArray(user.unlocked_items) ? user.unlocked_items : [];

    // Check if user has enough coins
    if (currentCoins < itemCost) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'INSUFFICIENT_COINS', currentCoins, required: itemCost, userId }) };
    }

    // Check if item is already unlocked
    if (currentUnlockedItems.includes(itemId)) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'ITEM_ALREADY_OWNED', userId }) };
    }

    // Calculate new values
    const newCoins = Math.max(0, currentCoins - itemCost);
    const newUnlockedItems = [...new Set([...currentUnlockedItems, itemId])];

    // Update user
    const { error: updErr } = await supabase
      .from('users')
      .update({
        coins: newCoins,
        unlocked_items: newUnlockedItems
      })
      .eq('id', userId);

    if (updErr) {
      console.error('[shopBuy] Update error:', updErr);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'USER_UPDATE_FAILED', details: updErr.message, userId }) };
    }

    // Insert ledger entry
    const ledgerPayload = {
      user_id: userId,
      delta: -itemCost,
      reason: 'shop_purchase',
      ref_type: 'shop_item',
      ref_id: itemId,
    };
    const { error: ledgerErr } = await supabase.from('coin_ledger').insert(ledgerPayload);
    if (ledgerErr) {
      console.warn('[shopBuy] Ledger insert failed (non-fatal):', ledgerErr.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        coins: newCoins,
        applied: -itemCost,
        unlockedItems: newUnlockedItems,
        userId
      })
    };
  } catch (err) {
    console.error('[shopBuy] Exception:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};

