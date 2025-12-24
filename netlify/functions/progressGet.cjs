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
    const params = event.queryStringParameters || {};

    console.log('[progressGet]', { userId, unitId: params.unitId, hasSupabase: !!supabase });

    if (!supabase) {
      console.warn('[progressGet] Dev fallback - Supabase not available');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          progress: [],
          userId,
          note: 'dev-fallback',
          warning: 'Data not persisted - Supabase not configured'
        })
      };
    }

    let query = supabase.from('progress').select('*').eq('user_id', userId);
    if (params.unitId) query = query.eq('unit_id', params.unitId);

    const { data, error } = await query;
    if (error) {
      console.error('[progressGet] Query error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'PROGRESS_FETCH_FAILED', details: error.message, userId }) };
    }
    console.log('[progressGet] Success:', { userId, count: (data || []).length });
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, progress: data || [], userId }) };
  } catch (err) {
    console.error('[progressGet] Exception:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


