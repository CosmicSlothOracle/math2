/**
 * Helper utilities for updating user coins within Netlify Functions
 * without duplicating boilerplate logic.
 */

async function fetchUserCoins(supabase, userId) {
  if (!supabase) throw new Error('SUPABASE_CLIENT_REQUIRED');
  const { data, error } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
  if (error) throw error;
  if (Array.isArray(data) && data.length > 0) {
    return typeof data[0].coins === 'number' ? data[0].coins : 0;
  }
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'coins')) {
    return typeof data.coins === 'number' ? data.coins : 0;
  }
  return 0;
}

/**
 * Adjusts user coins atomically with basic validation and optional ledger logging.
 * Throws on insufficient balance for negative deltas.
 */
async function applyCoinDelta(supabase, {
  userId,
  delta,
  reason = null,
  refType = null,
  refId = null,
}) {
  if (!supabase) throw new Error('SUPABASE_CLIENT_REQUIRED');
  if (!userId) throw new Error('USER_ID_REQUIRED');
  if (!Number.isFinite(delta)) throw new Error('INVALID_DELTA');

  const prev = await fetchUserCoins(supabase, userId);
  const next = prev + delta;
  if (next < 0) {
    const err = new Error('INSUFFICIENT_COINS');
    err.code = 'INSUFFICIENT_COINS';
    err.previous = prev;
    throw err;
  }

  const safeNext = Math.max(0, next);
  const { error: updateError } = await supabase.from('users').update({ coins: safeNext }).eq('id', userId);
  if (updateError) throw updateError;

  try {
    await supabase.from('coin_ledger').insert({
      user_id: userId,
      delta,
      reason,
      ref_type: refType,
      ref_id: refId,
    });
  } catch (ledgerError) {
    console.warn('[coins] Ledger insert failed (non-fatal):', ledgerError.message);
  }

  return { previous: prev, updated: safeNext };
}

module.exports = { fetchUserCoins, applyCoinDelta };


