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
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : null;
    const loginName = typeof body.loginName === 'string' ? body.loginName.trim() : null;

    // Validate display name
    if (!displayName || displayName.length < 2) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'INVALID_DISPLAY_NAME',
          message: 'Display name must be at least 2 characters',
        }),
      };
    }

    if (displayName.length > 30) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'DISPLAY_NAME_TOO_LONG',
          message: 'Display name must be 30 characters or less',
        }),
      };
    }

    // Validate login name
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

    if (loginName.length > 30) {
      return {
        statusCode: 400,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'LOGIN_NAME_TOO_LONG',
          message: 'Login name must be 30 characters or less',
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
            login_name: loginName,
            coins: 250,
            registered: true,
          },
          note: 'dev-fallback',
        }),
      };
    }

    // Check if login_name is already taken by another user
    const { data: existingLoginName, error: loginNameCheckError } = await supabase
      .from('users')
      .select('id, login_name')
      .eq('login_name', loginName)
      .limit(1);

    if (loginNameCheckError) {
      console.error('[register] Login name check error:', loginNameCheckError);
      // Continue - will be caught by upsert if there's a constraint
    }

    if (existingLoginName && existingLoginName.length > 0) {
      const existingId = existingLoginName[0].id;
      // If it's the same user, allow them to "re-register" (update login_name)
      if (existingId !== userId) {
        return {
          statusCode: 409,
          headers: HEADERS,
          body: JSON.stringify({
            ok: false,
            error: 'LOGIN_NAME_TAKEN',
            message: 'This login name is already taken',
          }),
        };
      }
    }

    // Get existing user to preserve coins (optimize: only if username check passed)
    const { data: existingUser } = await supabase
      .from('users')
      .select('coins')
      .eq('id', userId)
      .limit(1)
      .maybeSingle(); // Use maybeSingle to avoid error if not found

    // Upsert user with display_name and login_name
    const upsertPayload = {
      id: userId,
      display_name: displayName,
      login_name: loginName,
    };

    // Only set coins if new user
    if (!existingUser) {
      upsertPayload.coins = 250;
    }

    console.log('[register] Attempting upsert with payload:', { id: upsertPayload.id, display_name: upsertPayload.display_name, login_name: upsertPayload.login_name });
    
    const { data: upsertResult, error: upsertError } = await supabase
      .from('users')
      .upsert(upsertPayload, { onConflict: 'id' })
      .select()
      .single();

    if (upsertError) {
      console.error('[register] Upsert error:', upsertError);
      console.error('[register] Error details:', JSON.stringify(upsertError, null, 2));
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'REGISTRATION_FAILED',
          message: upsertError.message || 'Failed to save user to database',
          details: upsertError.code || upsertError.hint || '',
        }),
      };
    }

    console.log('[register] Upsert successful, result:', { id: upsertResult?.id, display_name: upsertResult?.display_name, login_name: upsertResult?.login_name });

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
          login_name: returnedUser.login_name || loginName,
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

