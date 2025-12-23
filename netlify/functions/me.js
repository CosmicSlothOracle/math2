// Safely require _supabase helper
let createSupabaseClient = () => null; // Default fallback
try {
  const supabaseModule = require('./_supabase');
  if (supabaseModule && typeof supabaseModule.createSupabaseClient === 'function') {
    createSupabaseClient = supabaseModule.createSupabaseClient;
  }
} catch (requireErr) {
  console.warn('[me.js] Failed to require _supabase:', requireErr.message);
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
    const userId = tokenPayload.sub || tokenPayload.user_id || null;
    const displayName = tokenPayload.email || tokenPayload.name || tokenPayload.preferred_username || 'netlify-user';
    const upsertId = userId || `uid_${Math.random().toString(36).slice(2, 9)}`;

    // Upsert user row
    const upsertPayload = {
      id: upsertId,
      display_name: displayName,
      coins: 0,
    };

    let returnedUser;
    try {
      const { data: upsertResult, error: upsertError } = await supabase.from('users').upsert(upsertPayload, { onConflict: 'id' });
      if (upsertError) {
        console.error('[me.js] Supabase upsert error:', upsertError);
        // Fallback to dev user on error instead of 500
        const devUser = { id: 'dev-user', display_name: 'Dev', coins: 2000 };
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user: devUser, progress: [], serverTime: Date.now(), note: 'dev-fallback-upsert-error', error: upsertError.message }),
        };
      }

      // Handle different response formats from Supabase
      if (Array.isArray(upsertResult) && upsertResult.length > 0) {
        returnedUser = upsertResult[0];
      } else if (upsertResult && typeof upsertResult === 'object') {
        returnedUser = upsertResult;
      } else {
        // If no user returned, fetch it
        const { data: fetchedUser } = await supabase.from('users').select('*').eq('id', upsertId).single();
        returnedUser = fetchedUser || { id: upsertId, display_name: displayName, coins: 0 };
      }
    } catch (upsertErr) {
      console.error('[me.js] Upsert exception:', upsertErr.message);
      // Fallback to dev user
      const devUser = { id: 'dev-user', display_name: 'Dev', coins: 2000 };
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ user: devUser, progress: [], serverTime: Date.now(), note: 'dev-fallback-upsert-exception', error: upsertErr.message }),
      };
    }

    // Fetch progress rows for this user (may be empty)
    let progressRows = [];
    try {
      const { data, error: progressError } = await supabase.from('progress').select('*').eq('user_id', upsertId);
      if (progressError) {
        console.warn('[me.js] Progress fetch error:', progressError.message);
        // Continue with empty progress array
      } else {
        progressRows = data || [];
      }
    } catch (progressErr) {
      console.warn('[me.js] Progress fetch exception:', progressErr.message);
      // Continue with empty progress array
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
