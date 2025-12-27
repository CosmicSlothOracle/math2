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
    const userId = getUserIdFromEvent(event);
    const supabase = createSupabaseClient();
    const body = event.body ? JSON.parse(event.body) : {};
    const username = typeof body.username === 'string' ? body.username.trim() : null;
    const displayName = username || 'User';

    if (!username || username.length < 2) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'INVALID_USERNAME',
          message: 'Username must be at least 2 characters',
        }),
      };
    }

    if (username.length > 30) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'USERNAME_TOO_LONG',
          message: 'Username must be 30 characters or less',
        }),
      };
    }

    // Dev fallback
    if (!supabase) {
      console.warn('[register] Dev fallback - Supabase unavailable');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          user: {
            id: userId,
            username: displayName,
            display_name: displayName,
            coins: 250,
            registered: true,
          },
          note: 'dev-fallback',
        }),
      };
    }

    // Check if username is already taken
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id, display_name')
      .eq('display_name', displayName)
      .limit(1);

    if (checkError) {
      console.error('[register] Username check error:', checkError);
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingId = existingUsers[0].id;
      // If it's the same user, allow them to "re-register"
      if (existingId !== userId) {
        return {
          statusCode: 409,
          headers: HEADERS,
          body: JSON.stringify({
            ok: false,
            error: 'USERNAME_TAKEN',
            message: 'This username is already taken',
          }),
        };
      }
    }

    // Get existing user to preserve coins
    const { data: existingUser } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .limit(1)
      .single();

    // Upsert user with display_name
    const upsertPayload = {
      id: userId,
      display_name: displayName,
    };

    // Only set coins if new user
    if (!existingUser) {
      upsertPayload.coins = 250;
    }

    const { data: upsertResult, error: upsertError } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single();

    if (upsertError) {
      console.error('[register] Upsert error:', upsertError);
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'REGISTRATION_FAILED',
          message: upsertError.message,
        }),
      };
    }

    // Handle different response formats
    let returnedUser = upsertResult;
    if (Array.isArray(upsertResult) && upsertResult.length > 0) {
      returnedUser = upsertResult[0];
    } else if (!upsertResult) {
      // Fetch if not returned
      const { data: fetched } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      returnedUser = fetched || upsertPayload;
    }

    // Set cookie for persistence
    const headers = { ...HEADERS };
    if (userId.startsWith('anon_')) {
      headers['Set-Cookie'] = `mm_anon_id=${userId}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        user: {
          ...returnedUser,
          username: returnedUser.display_name || displayName,
          registered: true,
        },
      }),
    };
  } catch (err) {
    console.error('[register] Exception:', err);
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

