const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');

exports.handler = async function (event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    const userId = getUserIdFromEvent(event);
    const supabase = createSupabaseClient();
    const body = event.body ? JSON.parse(event.body) : {};

    const payload = {};

    if (typeof body.avatar === 'string') {
      payload.avatar = body.avatar;
    }
    if (typeof body.calculatorSkin === 'string') {
      payload.calculator_skin = body.calculatorSkin;
    }
    if (Array.isArray(body.activeEffects)) {
      payload.active_effects = body.activeEffects.map(String);
    }
    if (Array.isArray(body.unlockedItems)) {
      payload.unlocked_items = body.unlockedItems.map(String);
    }
    if (Array.isArray(body.completedUnits)) {
      payload.completed_units = body.completedUnits.map(String);
    }
    if (Array.isArray(body.masteredUnits)) {
      payload.mastered_units = body.masteredUnits.map(String);
    }
    if (Array.isArray(body.preClearedUnits)) {
      payload.pre_cleared_units = body.preClearedUnits.map(String);
    }
    if (Array.isArray(body.perfectStandardQuizUnits)) {
      payload.perfect_standard_quiz_units = body.perfectStandardQuizUnits.map(String);
    }
    if (Array.isArray(body.perfectBountyUnits)) {
      payload.perfect_bounty_units = body.perfectBountyUnits.map(String);
    }

    if (Object.keys(payload).length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'NO_MUTATIONS', userId }) };
    }

    if (!supabase) {
      console.warn('[updateUser] Dev fallback - Supabase not configured');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          userId,
          note: 'dev-fallback',
          warning: 'User not persisted - Supabase missing',
        }),
      };
    }

    const { data, error } = await supabase
      .from('users')
      .update(payload)
      .eq('id', userId)
      .select()
      .limit(1);

    if (error) {
      console.error('[updateUser] Update failed:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'USER_UPDATE_FAILED', details: error.message, userId }) };
    }

    const updatedUser = Array.isArray(data) ? data[0] : data;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, user: updatedUser, userId }),
    };
  } catch (err) {
    console.error('[updateUser] Exception:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err && err.message }),
    };
  }
};

