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
    if (!supabase) {
      return { statusCode: 200, headers, body: JSON.stringify({ progress: [], note: 'dev-fallback', userId }) };
    }

    const params = event.queryStringParameters || {};
    let query = supabase.from('progress').select('*').eq('user_id', userId);
    if (params.unitId) query = query.eq('unit_id', params.unitId);

    const { data, error } = await query;
    if (error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'PROGRESS_FETCH_FAILED', details: error.message }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ progress: data || [] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


