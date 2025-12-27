const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');
const { applyCoinDelta } = require('./_coins.cjs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
  }

  try {
    const userId = getUserIdFromEvent(event);
    const supabase = createSupabaseClient();
    const body = event.body ? JSON.parse(event.body) : {};
    const battleId = typeof body.battleId === 'string' ? body.battleId : null;

    if (!battleId) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'INVALID_BATTLE_ID', userId }) };
    }

    if (!supabase) {
      console.warn('[battleAccept] Dev fallback - Supabase unavailable');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          userId,
          battle: {
            id: battleId,
            status: 'running',
            opponent_id: userId,
            accepted_at: new Date().toISOString(),
            note: 'dev-fallback',
          },
        }),
      };
    }

    const { data: battleRows, error: fetchError } = await supabase.from('battles').select('*').eq('id', battleId).limit(1);
    if (fetchError) {
      console.error('[battleAccept] Fetch error:', fetchError);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_FETCH_FAILED', details: fetchError.message, userId }) };
    }
    const battle = Array.isArray(battleRows) && battleRows.length > 0 ? battleRows[0] : null;
    if (!battle) {
      return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_NOT_FOUND', userId }) };
    }
    if (battle.status !== 'pending') {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_NOT_OPEN', status: battle.status, userId }) };
    }
    if (battle.challenger_id === userId) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'CANNOT_ACCEPT_OWN_BATTLE', userId }) };
    }
    if (battle.opponent_id && battle.opponent_id !== userId) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_ALREADY_ASSIGNED', userId }) };
    }

    const stake = Math.max(0, Number(battle.stake || 0));
    if (stake > 0) {
      await applyCoinDelta(supabase, {
        userId,
        delta: -stake,
        reason: 'battle_stake',
        refType: 'battle',
        refId: battleId,
      });
    }

    const nowIso = new Date().toISOString();
    const updates = {
      status: 'running',
      opponent_id: userId,
      accepted_at: nowIso,
      last_event_at: nowIso,
    };
    const { data: updatedRows, error: updateError } = await supabase.from('battles').update(updates).eq('id', battleId).select().limit(1);
    if (updateError) {
      console.error('[battleAccept] Update failed:', updateError);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_ACCEPT_FAILED', details: updateError.message, userId }) };
    }

    const updated = Array.isArray(updatedRows) ? updatedRows[0] : updatedRows;
    const { data: coinRow } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
    const coins = Array.isArray(coinRow) && coinRow.length > 0 ? coinRow[0].coins : (coinRow && coinRow.coins) || 0;

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        ok: true,
        userId,
        battle: updated,
        coins,
      }),
    };
  } catch (err) {
    console.error('[battleAccept] Exception:', err);
    const status = err && err.code === 'INSUFFICIENT_COINS' ? 400 : 500;
    return {
      statusCode: status,
      headers: HEADERS,
      body: JSON.stringify({
        ok: false,
        error: err && err.code === 'INSUFFICIENT_COINS' ? 'INSUFFICIENT_COINS' : 'INTERNAL_ERROR',
        message: err && err.message,
      }),
    };
  }
};


