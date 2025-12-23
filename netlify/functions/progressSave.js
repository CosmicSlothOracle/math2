const { createSupabaseClient } = require('./_supabase');
const { getUserIdFromEvent } = require('./_utils');

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
    const unitId = body.unitId;
    const questCoinsEarned = Number(body.questCoinsEarned || 0);
    const questCompletedCount = Number(body.questCompletedCount || 0);
    const bountyCompleted = !!body.bountyCompleted;
    const perfectStandardQuiz = !!body.perfectStandardQuiz;
    const perfectBounty = !!body.perfectBounty;

    console.log('[progressSave]', { userId, unitId, questCoinsEarned, questCompletedCount, bountyCompleted, perfectStandardQuiz, perfectBounty, hasSupabase: !!supabase });

    if (!unitId || typeof unitId !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'INVALID_UNIT_ID', userId }) };
    }
    if (!Number.isFinite(questCoinsEarned) || !Number.isFinite(questCompletedCount) || questCoinsEarned < 0 || questCompletedCount < 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'INVALID_NUMBERS', userId }) };
    }

    if (!supabase) {
      // dev fallback: return consistent shape but mark as fallback
      console.warn('[progressSave] Dev fallback - Supabase not available');
      const row = {
        user_id: userId,
        unit_id: unitId,
        quest_coins_earned: questCoinsEarned,
        quest_completed_count: questCompletedCount,
        bounty_completed: bountyCompleted,
        perfect_standard_quiz: perfectStandardQuiz,
        perfect_bounty: perfectBounty,
        updated_at: new Date().toISOString()
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          saved: row,
          userId,
          note: 'dev-fallback',
          warning: 'Data not persisted - Supabase not configured'
        })
      };
    }

    const payload = {
      user_id: userId,
      unit_id: unitId,
      quest_coins_earned: questCoinsEarned,
      quest_completed_count: questCompletedCount,
      bounty_completed: bountyCompleted,
      perfect_standard_quiz: perfectStandardQuiz,
      perfect_bounty: perfectBounty,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('progress').upsert(payload, { onConflict: 'user_id,unit_id', returning: 'representation' });
    if (error) {
      console.error('[progressSave] Upsert error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'PROGRESS_SAVE_FAILED', details: error.message, userId }) };
    }
    const saved = Array.isArray(data) ? data[0] : data;
    console.log('[progressSave] Success:', { userId, unitId, saved });
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, saved, userId }) };
  } catch (err) {
    console.error('[progressSave] Exception:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


