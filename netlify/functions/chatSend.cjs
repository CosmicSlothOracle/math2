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
    const body = event.body ? JSON.parse(event.body) : {};
    const text = (body.text || '').toString().trim();
    const channelId = body.channelId || 'class:global';
    const username = body.username || null;
    const avatar = body.avatar || null;

    console.log('[chatSend]', { userId, channelId, username, textLength: text.length, hasSupabase: !!supabase });

    if (!text) {
      return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'EMPTY_TEXT', userId }) };
    }

    if (!supabase) {
      // dev fallback: return consistent shape but mark as fallback
      console.warn('[chatSend] Dev fallback - Supabase not available');
      const msg = {
        id: `dev-${Date.now()}`,
        channel_id: channelId,
        sender_id: userId,
        username: username || 'Dev',
        avatar,
        text,
        created_at: new Date().toISOString()
      };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: msg,
          userId,
          note: 'dev-fallback',
          warning: 'Message not persisted - Supabase not configured'
        })
      };
    }

    const payload = { channel_id: channelId, sender_id: userId, username: username, avatar, text };
    const { data, error } = await supabase.from('messages').insert(payload).select().limit(1);
    if (error) {
      console.error('[chatSend] Insert error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          ok: false,
          error: 'MESSAGE_INSERT_FAILED',
          details: error.message,
          userId
        })
      };
    }
    const msg = Array.isArray(data) ? data[0] : data;
    console.log('[chatSend] Success:', { userId, messageId: msg.id });
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, message: msg, userId }) };
  } catch (err) {
    console.error('[chatSend] Exception:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: 'INTERNAL_ERROR',
        message: err && err.message
      })
    };
  }
};


