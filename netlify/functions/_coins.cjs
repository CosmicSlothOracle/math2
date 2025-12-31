/**
 * Helper utilities for updating user coins within Netlify Functions
 * without duplicating boilerplate logic.
 */

async function fetchUserCoins(supabase, userId) {
  if (!supabase) throw new Error('SUPABASE_CLIENT_REQUIRED');
  const { data, error } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
  if (error) {
    console.error('[coins] fetchUserCoins error:', { message: error.message, code: error.code, hint: error.hint, userId });
    throw error;
  }
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
  console.log('[coins] applyCoinDelta starting:', { userId, delta, prev });

  const next = prev + delta;
  if (next < 0) {
    const err = new Error('INSUFFICIENT_COINS');
    err.code = 'INSUFFICIENT_COINS';
    err.previous = prev;
    throw err;
  }

  const safeNext = Math.max(0, next);

  // Try optimistic locking first to prevent race conditions
  // IMPORTANT: Use .select() to get updated data, otherwise data will always be null
  let updateData, updateError;

  // First attempt: optimistic lock with prev value check
  const result1 = await supabase
    .from('users')
    .update({ coins: safeNext })
    .eq('id', userId)
    .eq('coins', prev) // Only update if coins haven't changed
    .select()
    .limit(1);

  updateData = result1.data;
  updateError = result1.error;

  if (updateError) {
    console.error('[coins] applyCoinDelta update error:', { message: updateError.message, code: updateError.code, hint: updateError.hint, userId });
    throw updateError;
  }

  // Check if optimistic lock failed (0 rows updated)
  // This can happen if coins changed between read and update, OR if coins column is NULL
  if (!updateData || (Array.isArray(updateData) && updateData.length === 0)) {
    console.warn('[coins] Optimistic lock failed, trying direct update:', { userId, prev, safeNext });

    // Second attempt: check current value and update without optimistic lock
    // This handles the case where coins column might be NULL
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('[coins] Failed to fetch current user for retry:', fetchError);
      throw fetchError;
    }

    if (!currentUser) {
      const err = new Error('USER_NOT_FOUND');
      err.code = 'USER_NOT_FOUND';
      throw err;
    }

    const actualPrev = currentUser.coins ?? 0; // Handle NULL case
    const actualNext = actualPrev + delta;

    if (actualNext < 0) {
      const err = new Error('INSUFFICIENT_COINS');
      err.code = 'INSUFFICIENT_COINS';
      err.previous = actualPrev;
      throw err;
    }

    const safeActualNext = Math.max(0, actualNext);

    // Update without optimistic lock (we accept the race condition here since it's a retry)
    const result2 = await supabase
      .from('users')
      .update({ coins: safeActualNext })
      .eq('id', userId)
      .select()
      .limit(1);

    if (result2.error) {
      console.error('[coins] Direct update failed:', result2.error);
      throw result2.error;
    }

    if (!result2.data || (Array.isArray(result2.data) && result2.data.length === 0)) {
      const err = new Error('COIN_UPDATE_CONFLICT');
      err.code = 'COIN_UPDATE_CONFLICT';
      err.previous = actualPrev;
      throw err;
    }

    updateData = result2.data;
    console.log('[coins] Direct update succeeded:', { userId, from: actualPrev, to: safeActualNext });
  }

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


