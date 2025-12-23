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
    const params = event.queryStringParameters || {};
    const channelId = params.channelId || 'class:global';
    const since = params.since ? new Date(Number(params.since)) : null;
    if (!supabase) {
      // dev fallback: return a few static messages
      const msgs = [
        { id: 'dev-1', channel_id: channelId, sender_id: 'dev-user', username: 'Dev', text: 'Welcome to the class chat (dev)', created_at: Date.now() - 60000 },
      ];
      return { statusCode: 200, headers, body: JSON.stringify({ messages: msgs }) };
    }

    let query = supabase.from('messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: true }).limit(200);
    if (since) query = query.gt('created_at', since.toISOString());
    const { data, error } = await query;
    if (error) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'MESSAGES_FETCH_FAILED', details: error.message }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ messages: data || [] }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


