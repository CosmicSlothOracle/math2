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
      const fallbackUserId = getUserIdFromEvent(event);
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          user: {
            id: fallbackUserId,
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

    // CRITICAL FIX: Check if login_name already exists FIRST
    // If it exists, use that user's ID (allow re-registration/update)
    // If it doesn't exist, generate a NEW user ID (don't use anon ID from cookie)
    const { data: existingLoginName, error: loginNameCheckError } = await supabase
      .from('users')
      .select('id, login_name, coins')
      .eq('login_name', loginName)
      .limit(1)
      .maybeSingle();

    if (loginNameCheckError) {
      console.error('[register] Login name check error:', loginNameCheckError);
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'REGISTRATION_FAILED',
          message: 'Failed to check if login name exists: ' + (loginNameCheckError.message || 'Unknown error'),
        }),
      };
    }

    let userId;
    let existingUser = null;

    if (existingLoginName) {
      // Login name exists - use that user's ID (allow re-registration/update)
      userId = existingLoginName.id;
      existingUser = existingLoginName;
      console.log('[register] Login name exists, using existing user ID:', userId);
    } else {
      // Login name doesn't exist - generate NEW user ID
      // CRITICAL: Don't use anon ID from cookie, generate a fresh one
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      userId = `anon_${timestamp}_${random}`;
      console.log('[register] New login name, generating new user ID:', userId);
    }

    // Upsert user with display_name and login_name
    const upsertPayload = {
      id: userId,
      display_name: displayName,
      login_name: loginName,
    };

    // Only set coins if new user (preserve coins for existing users)
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

    // CRITICAL FIX: Always set cookie with the user's ID
    // This ensures that bootstrapServerUser() will load the correct user
    const headers = { ...HEADERS };
    if (userId) {
      headers['Set-Cookie'] = `mm_anon_id=${userId}; Path=/; Max-Age=31536000; SameSite=Lax`;
      console.log('[register] Set cookie with user ID:', userId);
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

