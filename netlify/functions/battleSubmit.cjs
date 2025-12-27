const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');
const { applyCoinDelta } = require('./_coins.cjs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function computeScore(summary = {}) {
  const correct = Number(summary.correctCount || 0);
  const total = Number(summary.totalTasks || summary.roundCount || 0);
  const percentage = Number(summary.percentage || (total > 0 ? (correct / total) * 100 : 0));
  const time = Number(summary.solveTimeMs || summary.timeMs || 0);
  return { correct, total, percentage: Math.round(percentage), time };
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
  }

  try {
    const userId = getUserIdFromEvent(event);
    const supabase = createSupabaseClient();
    const body = event.body ? JSON.parse(event.body) : {};

    const battleId = typeof body.battleId === 'string' ? body.battleId : null;
    const submission = body.submission && typeof body.submission === 'object' ? body.submission : null;

    if (!battleId || !submission) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'INVALID_PAYLOAD', userId }) };
    }

    if (!supabase) {
      console.warn('[battleSubmit] Dev fallback - Supabase unavailable');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          userId,
          battleId,
          submission,
          note: 'dev-fallback',
        }),
      };
    }

    const { data: battleRows, error: battleError } = await supabase.from('battles').select('*').eq('id', battleId).limit(1);
    if (battleError) {
      console.error('[battleSubmit] Battle fetch failed:', battleError);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_FETCH_FAILED', details: battleError.message, userId }) };
    }
    const battle = Array.isArray(battleRows) && battleRows.length > 0 ? battleRows[0] : null;
    if (!battle) {
      return { statusCode: 404, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_NOT_FOUND', userId }) };
    }
    if (battle.challenger_id !== userId && battle.opponent_id !== userId) {
      return { statusCode: 403, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'NOT_PARTICIPANT', userId }) };
    }
    if (battle.status === 'finished') {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_FINISHED', userId }) };
    }
    if (!battle.opponent_id) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_NOT_ACCEPTED', userId }) };
    }

    const { data: existingTurns } = await supabase.from('battle_turns').select('id').eq('battle_id', battleId).eq('player_id', userId).limit(1);
    if (Array.isArray(existingTurns) && existingTurns.length > 0) {
      return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'ALREADY_SUBMITTED', userId }) };
    }

    const sanitizedSubmission = JSON.parse(JSON.stringify(submission));
    const turnPayload = {
      battle_id: battleId,
      player_id: userId,
      turn_index: 0,
      is_correct: Number(sanitizedSubmission.correctCount || 0) >= Number(sanitizedSubmission.totalTasks || 0) && Number(sanitizedSubmission.totalTasks || 0) > 0,
      solve_time_ms: Number(sanitizedSubmission.solveTimeMs || sanitizedSubmission.timeMs || 0) || null,
      answer_payload: sanitizedSubmission,
    };

    const { data: insertRows, error: insertError } = await supabase.from('battle_turns').insert(turnPayload).select().limit(1);
    if (insertError) {
      console.error('[battleSubmit] Insert failed:', insertError);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'TURN_INSERT_FAILED', details: insertError.message, userId }) };
    }

    const summaryStats = computeScore(sanitizedSubmission);
    const partialNow = new Date().toISOString();
    const partialUpdate =
      battle.challenger_id === userId
        ? {
            challenger_summary: sanitizedSubmission,
            challenger_score: summaryStats.correct,
            challenger_time_ms: summaryStats.time,
            last_event_at: partialNow,
          }
        : {
            opponent_summary: sanitizedSubmission,
            opponent_score: summaryStats.correct,
            opponent_time_ms: summaryStats.time,
            last_event_at: partialNow,
          };
    const { error: partialError } = await supabase.from('battles').update(partialUpdate).eq('id', battleId);
    if (partialError) {
      console.warn('[battleSubmit] Partial update failed:', partialError.message);
    }

    const { data: allTurns, error: turnsError } = await supabase.from('battle_turns').select('*').eq('battle_id', battleId);
    if (turnsError) {
      console.error('[battleSubmit] Fetch turns failed:', turnsError);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'TURN_FETCH_FAILED', details: turnsError.message, userId }) };
    }

    const challengerTurn = (allTurns || []).find(t => t.player_id === battle.challenger_id);
    const opponentTurn = (allTurns || []).find(t => t.player_id === battle.opponent_id);
    let winnerId = null;
    let resultReason = 'waiting';
    let completed = false;
    let challengerScore = battle.challenger_score || 0;
    let opponentScore = battle.opponent_score || 0;
    let challengerTime = battle.challenger_time_ms || 0;
    let opponentTime = battle.opponent_time_ms || 0;
    let challengerSummary = battle.challenger_summary || null;
    let opponentSummary = battle.opponent_summary || null;

    if (challengerTurn && opponentTurn) {
      completed = true;
      const challengerStats = computeScore(challengerTurn.answer_payload);
      const opponentStats = computeScore(opponentTurn.answer_payload);
      challengerScore = challengerStats.correct;
      opponentScore = opponentStats.correct;
      challengerTime = challengerStats.time;
      opponentTime = opponentStats.time;
      challengerSummary = challengerTurn.answer_payload;
      opponentSummary = opponentTurn.answer_payload;

      if (challengerStats.correct > opponentStats.correct) {
        winnerId = battle.challenger_id;
        resultReason = 'score';
      } else if (opponentStats.correct > challengerStats.correct) {
        winnerId = battle.opponent_id;
        resultReason = 'score';
      } else if (challengerStats.time && opponentStats.time && challengerStats.time !== opponentStats.time) {
        winnerId = challengerStats.time < opponentStats.time ? battle.challenger_id : battle.opponent_id;
        resultReason = 'time';
      } else {
        winnerId = null;
        resultReason = 'tie';
      }

      if (battle.status !== 'finished') {
        const nowIso = new Date().toISOString();
        const updatePayload = {
          status: 'finished',
          finished_at: nowIso,
          last_event_at: nowIso,
          winner_id: winnerId,
          result_reason: resultReason,
          challenger_score: challengerScore,
          opponent_score: opponentScore,
          challenger_time_ms: challengerTime,
          opponent_time_ms: opponentTime,
          challenger_summary: challengerSummary,
          opponent_summary: opponentSummary,
        };

        const { error: finishError } = await supabase.from('battles').update(updatePayload).eq('id', battleId);
        if (finishError) {
          console.error('[battleSubmit] Failed to mark finished:', finishError);
        }

        const stake = Math.max(0, Number(battle.stake || 0));
        if (stake > 0) {
          if (winnerId) {
            await applyCoinDelta(supabase, {
              userId: winnerId,
              delta: stake * 2,
              reason: 'battle_win',
              refType: 'battle',
              refId: battleId,
            });
          } else {
            // tie refund
            await applyCoinDelta(supabase, {
              userId: battle.challenger_id,
              delta: stake,
              reason: 'battle_refund',
              refType: 'battle',
              refId: battleId,
            });
            await applyCoinDelta(supabase, {
              userId: battle.opponent_id,
              delta: stake,
              reason: 'battle_refund',
              refType: 'battle',
              refId: battleId,
            });
          }
        }
      }
    }

    const { data: coinRow } = await supabase.from('users').select('coins').eq('id', userId).limit(1);
    const coins = Array.isArray(coinRow) && coinRow.length > 0 ? coinRow[0].coins : (coinRow && coinRow.coins) || 0;

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        ok: true,
        userId,
        battleId,
        submission: turnPayload,
        completed,
        winnerId,
        resultReason,
        challengerScore,
        opponentScore,
        coins,
      }),
    };
  } catch (err) {
    console.error('[battleSubmit] Exception:', err);
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


