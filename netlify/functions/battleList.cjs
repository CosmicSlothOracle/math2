const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');

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
    const params = event.queryStringParameters || {};
    const view = (params.view || 'mine').toLowerCase();

    if (!supabase) {
      console.warn('[battleList] Dev fallback - Supabase unavailable');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          userId,
          view,
          battles: [
            {
              id: `dev-${Date.now()}`,
              scenario_id: 'speed_geometry',
              challenger_id: userId,
              opponent_id: null,
              unit_id: 'u1',
              unit_title: 'Figuren verstehen',
              stake: 25,
              round_count: 3,
              task_ids: [],
              status: 'pending',
              created_at: new Date().toISOString(),
            },
          ],
          note: 'dev-fallback',
        }),
      };
    }

    let query = supabase.from('battles').select('*').order('created_at', { ascending: false }).limit(view === 'open' ? 25 : 50);

    if (view === 'open') {
      query = query.eq('status', 'pending').is('opponent_id', null).neq('challenger_id', userId);
    } else {
      query = query.or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[battleList] Query failed:', error);
      return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ ok: false, error: 'BATTLE_LIST_FAILED', details: error.message, userId }) };
    }

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        ok: true,
        userId,
        view,
        battles: data || [],
      }),
    };
  } catch (err) {
    console.error('[battleList] Exception:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        ok: false,
        error: 'INTERNAL_ERROR',
        message: err && err.message,
      }),
    };
  }
};


