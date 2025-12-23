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
    const unitId = body.unitId;
    const questCoinsEarned = Number(body.questCoinsEarned || 0);
    const questCompletedCount = Number(body.questCompletedCount || 0);
    const bountyCompleted = !!body.bountyCompleted;

    if (!unitId || typeof unitId !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'INVALID_UNIT_ID' }) };
    }
    if (questCoinsEarned < 0 || questCompletedCount < 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'INVALID_NUMBERS' }) };
    }

    if (!supabase) {
      // dev fallback: echo back the saved row
      const row = { user_id: userId, unit_id: unitId, quest_coins_earned: questCoinsEarned, quest_completed_count: questCompletedCount, bounty_completed: bountyCompleted, updated_at: Date.now() };
      return { statusCode: 200, headers, body: JSON.stringify({ saved: row, note: 'dev-fallback' }) };
    }

    const payload = {
      user_id: userId,
      unit_id: unitId,
      quest_coins_earned: questCoinsEarned,
      quest_completed_count: questCompletedCount,
      bounty_completed: bountyCompleted,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('progress').upsert(payload, { returning: 'representation' });
    if (error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'PROGRESS_SAVE_FAILED', details: error.message }) };
    }
    const saved = Array.isArray(data) ? data[0] : data;
    return { statusCode: 200, headers, body: JSON.stringify({ saved }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


