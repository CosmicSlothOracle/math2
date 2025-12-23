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
    const text = (body.text || '').toString().trim();
    const channelId = body.channelId || 'class:global';
    const username = body.username || null;

    if (!text) return { statusCode: 400, headers, body: JSON.stringify({ error: 'EMPTY_TEXT' }) };

    if (!supabase) {
      // dev fallback: echo back a message structure
      const msg = { id: `dev-${Date.now()}`, channel_id: channelId, sender_id: userId, username: username || 'Dev', text, created_at: Date.now() };
      return { statusCode: 200, headers, body: JSON.stringify({ message: msg, note: 'dev-fallback' }) };
    }

    const payload = { channel_id: channelId, sender_id: userId, username: username, text };
    const { data, error } = await supabase.from('messages').insert(payload).select().limit(1);
    if (error) {
      console.error('[chatSend] Insert error:', error);
      // Fallback: return message structure even on error
      const msg = { id: `fallback-${Date.now()}`, channel_id: channelId, sender_id: userId, username: username || 'User', text, created_at: new Date().toISOString() };
      return { statusCode: 200, headers, body: JSON.stringify({ message: msg, note: 'dev-fallback-insert-error', error: error.message }) };
    }
    const msg = Array.isArray(data) ? data[0] : data;
    return { statusCode: 200, headers, body: JSON.stringify({ message: msg }) };
  } catch (err) {
    console.error('[chatSend] Exception:', err);
    // Always return 200 with fallback message
    const body = event.body ? JSON.parse(event.body) : {};
    const userId = getUserIdFromEvent(event);
    const msg = { id: `error-${Date.now()}`, channel_id: body.channelId || 'class:global', sender_id: userId, username: body.username || 'User', text: body.text || '', created_at: new Date().toISOString() };
    return { statusCode: 200, headers, body: JSON.stringify({ message: msg, note: 'dev-fallback-exception', error: err && err.message }) };
  }
};


