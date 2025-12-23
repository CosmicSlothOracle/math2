// Safely require _supabase helper
let createSupabaseClient;
try {
  const supabaseModule = require('./_supabase');
  createSupabaseClient = supabaseModule && supabaseModule.createSupabaseClient;
} catch (requireErr) {
  console.warn('[me.js] Failed to require _supabase:', requireErr.message);
  createSupabaseClient = () => null; // Fallback function
}

exports.handler = async function (event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  try {
    const authHeader = (event.headers && (event.headers.Authorization || event.headers.authorization)) || '';
    const hasSupabaseEnv = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));

    // Dev fallback when no auth header or no supabase env vars
    if (!authHeader || !hasSupabaseEnv) {
      const devUser = { id: 'dev-user', display_name: 'Dev', coins: 2000 };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user: devUser, progress: [], serverTime: Date.now(), note: 'dev-fallback' }),
      };
    }

    // Minimal token decode (do NOT verify signature here) — extract payload fields if present
    const token = authHeader.split(' ')[1] || '';
    let tokenPayload = {};
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf8');
        tokenPayload = JSON.parse(payloadRaw);
      }
    } catch (e) {
      // ignore decode errors — we'll still attempt to use supabase with generated id
      tokenPayload = {};
    }

    // Initialize Supabase client (returns null if not possible)
    let supabase = null;
    try {
      if (typeof createSupabaseClient === 'function') {
        supabase = createSupabaseClient();
      }
    } catch (clientErr) {
      console.warn('[me.js] createSupabaseClient threw:', clientErr.message);
      supabase = null;
    }
    if (!supabase) {
      // Dev fallback: return dev user when Supabase isn't available
      const devUser = { id: 'dev-user', display_name: 'Dev', coins: 2000 };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user: devUser, progress: [], serverTime: Date.now(), note: 'dev-fallback-no-supabase' }),
      };
    }

    // Determine user id & display name
    const userId = tokenPayload.sub || tokenPayload.user_id || tokenPayload.sub || null;
    const displayName = tokenPayload.email || tokenPayload.name || tokenPayload.preferred_username || 'netlify-user';
    const upsertId = userId || `uid_${Math.random().toString(36).slice(2, 9)}`;

    // Upsert user row
    const upsertPayload = {
      id: upsertId,
      display_name: displayName,
      coins: 0,
    };

    const { data: upsertResult, error: upsertError } = await supabase.from('users').upsert(upsertPayload, { returning: 'representation' });
    if (upsertError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'SUPABASE_UPSERT_FAILED', details: upsertError.message }),
      };
    }

    const returnedUser = Array.isArray(upsertResult) ? upsertResult[0] : upsertResult;

    // Fetch progress rows for this user (may be empty)
    const { data: progressRows, error: progressError } = await supabase.from('progress').select('*').eq('user_id', upsertId);
    if (progressError) {
      // return user but include warning about progress fetch
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user: returnedUser, progress: [], serverTime: Date.now(), warning: 'PROGRESS_FETCH_FAILED', details: progressError.message }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user: returnedUser, progress: progressRows || [], serverTime: Date.now(), tokenPayload }),
    };
  } catch (err) {
    console.error('[me.js] Unhandled error:', err);
    // Even on error, try to return a dev fallback so the app doesn't break
    const devUser = { id: 'dev-user', display_name: 'Dev', coins: 2000 };
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: devUser,
        progress: [],
        serverTime: Date.now(),
        note: 'dev-fallback-error',
        error: err && err.message
      }),
    };
  }
};


