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
    const channelId = params.channelId || 'class:global';
    let since = null;
    if (params.since) {
      const sinceNum = Number(params.since);
      if (Number.isFinite(sinceNum) && sinceNum > 0) {
        since = new Date(sinceNum);
      } else {
        // Try ISO string
        try {
          since = new Date(params.since);
          if (isNaN(since.getTime())) since = null;
        } catch (e) {
          since = null;
        }
      }
    }

    console.log('[chatPoll]', { userId, channelId, since: since ? since.toISOString() : null, hasSupabase: !!supabase });

    if (!supabase) {
      console.warn('[chatPoll] Dev fallback - Supabase not available');
      const msgs = [
        {
          id: 'dev-1',
          channel_id: channelId,
          sender_id: 'dev-user',
          username: 'Dev',
          text: 'Welcome to the class chat (dev)',
          created_at: new Date(Date.now() - 60000).toISOString()
        },
      ];
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          messages: msgs,
          userId,
          note: 'dev-fallback',
          warning: 'Data not persisted - Supabase not configured'
        })
      };
    }

    let query = supabase.from('messages').select('*').eq('channel_id', channelId).order('created_at', { ascending: true }).limit(200);
    if (since && !isNaN(since.getTime())) {
      query = query.gt('created_at', since.toISOString());
    }
    const { data, error } = await query;
    if (error) {
      console.error('[chatPoll] Query error:', error);
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'MESSAGES_FETCH_FAILED', details: error.message, userId }) };
    }
    console.log('[chatPoll] Success:', { userId, count: (data || []).length });
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, messages: data || [], userId }) };
  } catch (err) {
    console.error('[chatPoll] Exception:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err && err.message }) };
  }
};


