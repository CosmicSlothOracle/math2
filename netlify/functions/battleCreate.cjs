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
    const scenarioId = typeof body.scenarioId === 'string' ? body.scenarioId : null;
    const unitId = typeof body.unitId === 'string' ? body.unitId : null;
    const unitTitle = typeof body.unitTitle === 'string' ? body.unitTitle : null;
    const opponentId = typeof body.opponentId === 'string' && body.opponentId.length > 0 ? body.opponentId : null;
    const stake = Math.max(0, Number(body.stake || 0));
    const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : null;
    const taskIds = Array.isArray(body.taskIds) ? body.taskIds.map(String) : [];
    let taskBundle = null;
    if (Array.isArray(body.taskBundle) || (body.taskBundle && typeof body.taskBundle === 'object')) {
      try {
        taskBundle = JSON.parse(JSON.stringify(body.taskBundle));
      } catch (cloneErr) {
        console.warn('[battleCreate] Failed to clone taskBundle:', cloneErr.message);
      }
    }
    const roundCount = Number(body.roundCount || (Array.isArray(taskBundle) ? taskBundle.length : 0));

    if (!unitId) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'INVALID_UNIT_ID', userId }) };
    }
    if (!roundCount || roundCount <= 0) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'INVALID_ROUND_COUNT', userId }) };
    }
    if (!taskBundle) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'TASK_BUNDLE_REQUIRED', userId }) };
    }

    if (!supabase) {
      console.warn('[battleCreate] Dev fallback - Supabase unavailable');
      const mockBattle = {
        id: `dev-${Date.now()}`,
        scenario_id: scenarioId,
        challenger_id: userId,
        opponent_id: opponentId,
        unit_id: unitId,
        unit_title: unitTitle,
        stake,
        round_count: roundCount,
        task_ids: taskIds,
        task_bundle: taskBundle,
        status: 'pending',
        metadata,
        created_at: new Date().toISOString(),
      };
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          userId,
          battle: mockBattle,
          coins: 2000 - stake,
          note: 'dev-fallback',
        }),
      };
    }

    if (stake > 0) {
      await applyCoinDelta(supabase, {
        userId,
        delta: -stake,
        reason: 'battle_stake',
        refType: 'battle',
      });
    }

    const payload = {
      scenario_id: scenarioId,
      challenger_id: userId,
      opponent_id: opponentId,
      unit_id: unitId,
      unit_title: unitTitle,
      stake,
      round_count: roundCount,
      task_ids: taskIds,
      task_bundle: taskBundle,
      metadata,
      status: 'pending',
      last_event_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('battles').insert(payload).select().limit(1);
    if (error) {
      console.error('[battleCreate] Insert failed:', error);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_CREATE_FAILED', details: error.message, userId }) };
    }

    const created = Array.isArray(data) ? data[0] : data;
    const { data: coinRow } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
    const coins = Array.isArray(coinRow) && coinRow.length > 0 ? coinRow[0].coins : (coinRow && coinRow.coins) || 0;

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        ok: true,
        battle: created,
        coins,
        userId,
      }),
    };
  } catch (err) {
    console.error('[battleCreate] Exception:', err);
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


