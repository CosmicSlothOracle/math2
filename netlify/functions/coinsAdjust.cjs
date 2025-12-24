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
    const delta = Number(body.delta || 0);
    const reason = body.reason || null;
    const refType = body.refType || null;
    const refId = body.refId || null;

    console.log('[coinsAdjust]', { userId, delta, reason, refType, refId, hasSupabase: !!supabase });

    if (!Number.isFinite(delta) || Math.abs(delta) > 100000) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'INVALID_DELTA', userId }) };
    }

    if (!supabase) {
      // Dev fallback: return consistent shape but mark as fallback
      console.warn('[coinsAdjust] Dev fallback - Supabase not available');
      const fakeCoins = 2000 + delta;
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          coins: fakeCoins,
          applied: delta,
          userId,
          note: 'dev-fallback',
          warning: 'Data not persisted - Supabase not configured'
        })
      };
    }

    // Fetch current coins
    const { data: userRows, error: fetchErr } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
    if (fetchErr) {
      console.error('[coinsAdjust] Fetch error:', fetchErr);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'USER_FETCH_FAILED', details: fetchErr.message, userId }) };
    }
    const prev = (userRows && userRows[0] && typeof userRows[0].coins === 'number') ? userRows[0].coins : 0;
    const newCoins = Math.max(0, prev + delta);
    const applied = newCoins - prev;

    console.log('[coinsAdjust]', { userId, prev, delta, newCoins, applied });

    // Update users.coins
    const { error: updErr } = await supabase.from('users').update({ coins: newCoins }).eq('id', userId);
    if (updErr) {
      console.error('[coinsAdjust] Update error:', updErr);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'USER_UPDATE_FAILED', details: updErr.message, userId }) };
    }

    // Insert ledger (non-fatal if fails)
    const ledgerPayload = {
      user_id: userId,
      delta: applied,
      reason,
      ref_type: refType,
      ref_id: refId,
    };
    const { error: ledgerErr } = await supabase.from('coin_ledger').insert(ledgerPayload);
    if (ledgerErr) {
      console.warn('[coinsAdjust] Ledger insert failed (non-fatal):', ledgerErr.message);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          coins: newCoins,
          applied,
          userId,
          warning: 'LEDGER_INSERT_FAILED',
          details: ledgerErr.message
        })
      };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, coins: newCoins, applied, userId }) };
  } catch (err) {
    console.error('[coinsAdjust] Exception:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


