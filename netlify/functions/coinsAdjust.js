const { createSupabaseClient } = require('./_supabase');
const { getUserIdFromEvent } = require('./_utils');

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user',
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

    if (!Number.isFinite(delta) || Math.abs(delta) > 100000) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'INVALID_DELTA' }) };
    }

    if (!supabase) {
      // Dev fallback: simple echo and do not persist across restarts
      const fake = { user: { id: userId, coins: 2000 + delta }, applied: delta };
      return { statusCode: 200, headers, body: JSON.stringify({ result: fake }) };
    }

    // Fetch current coins
    const { data: userRows, error: fetchErr } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
    if (fetchErr) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'USER_FETCH_FAILED', details: fetchErr.message }) };
    }
    const prev = (userRows && userRows[0] && typeof userRows[0].coins === 'number') ? userRows[0].coins : 0;
    const newCoins = Math.max(0, prev + delta);
    const applied = newCoins - prev;

    // Update users.coins
    const { error: updErr } = await supabase.from('users').update({ coins: newCoins }).eq('id', userId);
    if (updErr) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'USER_UPDATE_FAILED', details: updErr.message }) };
    }

    // Insert ledger
    const ledgerPayload = {
      user_id: userId,
      delta: applied,
      reason,
      ref_type: refType,
      ref_id: refId,
    };
    const { error: ledgerErr } = await supabase.from('coin_ledger').insert(ledgerPayload);
    if (ledgerErr) {
      // not fatal: warn in response
      return { statusCode: 200, headers, body: JSON.stringify({ coins: newCoins, applied, warning: 'LEDGER_INSERT_FAILED', details: ledgerErr.message }) };
    }

    return { statusCode: 200, headers, body: JSON.stringify({ coins: newCoins, applied }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


