const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
  }

  try {
    const supabase = createSupabaseClient();
    const body = event.body ? JSON.parse(event.body) : {};
    const loginName = typeof body.loginName === 'string' ? body.loginName.trim() : null;

    if (!loginName || loginName.length < 4) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'INVALID_LOGIN_NAME',
          message: 'Login name must be at least 4 characters',
        }),
      };
    }

    // Dev fallback
    if (!supabase) {
      console.warn('[login] Dev fallback - Supabase unavailable');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          user: {
            id: 'dev-user',
            username: 'Dev',
            display_name: 'Dev',
            login_name: loginName,
            coins: 2000,
            registered: true,
          },
          note: 'dev-fallback',
        }),
      };
    }

    // Find user by login_name
    console.log('[login] Searching for user with login_name:', loginName);
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('login_name', loginName)
      .maybeSingle();

    if (fetchError) {
      console.error('[login] Fetch error:', fetchError);
      console.error('[login] Error details:', JSON.stringify(fetchError, null, 2));
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'LOGIN_FAILED',
          message: 'Failed to search for user: ' + (fetchError.message || 'Unknown error'),
        }),
      };
    }

    if (!user) {
      console.log('[login] No user found with login_name:', loginName);
      // Debug: Check if any users exist at all
      const { data: allUsers, error: debugError } = await supabase
        .from('users')
        .select('id, display_name, login_name')
        .limit(5);
      console.log('[login] Debug - sample users in database:', allUsers);
      return {
        statusCode: 404,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'USER_NOT_FOUND',
          message: 'No user found with this login name',
        }),
      };
    }

    console.log('[login] User found:', { id: user.id, display_name: user.display_name, login_name: user.login_name });

    // CRITICAL FIX: Always set cookie with the user's ID from database
    // This ensures that bootstrapServerUser() will load the correct user
    // regardless of what anon ID was in the cookie before login
    const headers = { ...HEADERS };
    const userId = user.id;

    // Always set cookie with the user's actual ID from database
    // This overwrites any previous anon ID cookie
    if (userId) {
      headers['Set-Cookie'] = `mm_anon_id=${userId}; Path=/; Max-Age=31536000; SameSite=Lax`;
      console.log('[login] Set cookie with user ID:', userId);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        user: {
          ...user,
          username: user.display_name || 'User',
          registered: true,
        },
      }),
    };
  } catch (err) {
    console.error('[login] Exception:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({
        ok: false,
        error: 'INTERNAL_ERROR',
        message: err && err.message ? String(err.message) : 'Unknown error',
      }),
    };
  }
};

