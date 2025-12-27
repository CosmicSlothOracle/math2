// Safely require helpers
let createSupabaseClient = () => null; // Default fallback
let getUserIdFromEvent = () => 'dev-user'; // Default fallback
try {
  const supabaseModule = require('./_supabase.cjs');
  if (supabaseModule && typeof supabaseModule.createSupabaseClient === 'function') {
    createSupabaseClient = supabaseModule.createSupabaseClient;
  }
} catch (requireErr) {
  console.warn('[me.cjs] Failed to require _supabase:', requireErr.message);
}
try {
  const utilsModule = require('./_utils.cjs');
  if (utilsModule && typeof utilsModule.getUserIdFromEvent === 'function') {
    getUserIdFromEvent = utilsModule.getUserIdFromEvent;
  }
} catch (requireErr) {
  console.warn('[me.cjs] Failed to require _utils:', requireErr.message);
}

exports.handler = async function (event, context) {
  const baseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ ok: true }) };
  }

  try {
    // Use getUserIdFromEvent to get stable user ID (JWT, anon cookie, or dev override)
    let userId;
    try {
      userId = getUserIdFromEvent(event);
    } catch (userIdErr) {
      console.error('[me.js] getUserIdFromEvent error:', userIdErr);
      // Fallback to generating a new anon ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      userId = `anon_${timestamp}_${random}`;
    }

    if (!userId || typeof userId !== 'string') {
      console.error('[me.js] Invalid userId:', userId);
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      userId = `anon_${timestamp}_${random}`;
    }

    const hasSupabaseEnv = !!(process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY));

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

    // Dev fallback when no supabase env vars or client not available
    if (!hasSupabaseEnv || !supabase) {
      console.warn('[me.js] Dev fallback - Supabase not configured or client not available');
      const devUser = {
        id: userId, // Use the stable ID even in dev fallback
        display_name: 'Dev',
        coins: 2000,
        perfectStandardQuizUnits: [],
        perfectBountyUnits: [],
        completedUnits: [],
        masteredUnits: []
      };

      // Set cookie for anon ID persistence (if it's an anon ID)
      const headers = { ...baseHeaders };
      if (userId.startsWith('anon_')) {
        headers['Set-Cookie'] = `mm_anon_id=${userId}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          user: devUser,
          progress: [],
          serverTime: Date.now(),
          note: 'dev-fallback',
          warning: 'Data not persisted - Supabase not configured'
        }),
      };
    }

    // Extract display name from JWT if available
    const authHeader = (event.headers && (event.headers.Authorization || event.headers.authorization)) || '';
    let tokenPayload = {};
    let displayName = 'User';

    if (authHeader) {
      const token = authHeader.split(' ')[1] || '';
      try {
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payloadRaw = Buffer.from(parts[1], 'base64').toString('utf8');
          tokenPayload = JSON.parse(payloadRaw);
          displayName = tokenPayload.email || tokenPayload.name || tokenPayload.preferred_username || 'User';
        }
      } catch (e) {
        // ignore decode errors
      }
    }

    // Use userId from getUserIdFromEvent (stable anon ID if no JWT)
    const upsertId = userId;

    // Check if user already exists to preserve coins
    let existingUser = null;
    try {
      const { data: existingUserData } = await supabase.from('users').select('coins').eq('id', upsertId).limit(1);
      existingUser = (existingUserData && existingUserData.length > 0) ? existingUserData[0] : null;
    } catch (e) {
      // User doesn't exist yet, that's fine
      console.warn('[me.js] User check error:', e.message);
    }

    // Upsert user row - only set coins if user doesn't exist
    const upsertPayload = {
      id: upsertId,
      display_name: displayName,
    };

    // Only set coins to 250 if this is a new user (starting coins)
    if (!existingUser) {
      upsertPayload.coins = 250;
    }

    let returnedUser;
    try {
      const { data: upsertResult, error: upsertError } = await supabase.from('users').upsert(upsertPayload, { onConflict: 'id' });
      if (upsertError) {
        console.error('[me.js] Supabase upsert error:', upsertError);
        // Fallback to dev user on error instead of 500
      const devUser = {
        id: upsertId, // Use the stable ID even on error
        display_name: displayName,
        coins: 2000,
        perfectStandardQuizUnits: [],
        perfectBountyUnits: [],
        completedUnits: [],
        masteredUnits: []
      };
      const headers = { ...baseHeaders };
      if (upsertId.startsWith('anon_')) {
        headers['Set-Cookie'] = `mm_anon_id=${upsertId}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          user: devUser,
          progress: [],
          serverTime: Date.now(),
          note: 'dev-fallback-upsert-error',
          error: upsertError.message,
          warning: 'Data not persisted - Supabase error'
        }),
      };
      }

      // Handle different response formats from Supabase
      if (Array.isArray(upsertResult) && upsertResult.length > 0) {
        returnedUser = upsertResult[0];
      } else if (upsertResult && typeof upsertResult === 'object') {
        returnedUser = upsertResult;
      } else {
        // If no user returned, fetch it
        const { data: fetchedUser } = await supabase.from('users').select('*').eq('id', upsertId).limit(1);
        returnedUser = (fetchedUser && fetchedUser.length > 0) ? fetchedUser[0] : { id: upsertId, display_name: displayName, coins: 250 };
      }
    } catch (upsertErr) {
      console.error('[me.js] Upsert exception:', upsertErr.message);
      // Fallback to dev user
      const devUser = {
        id: upsertId, // Use the stable ID even on exception
        display_name: displayName,
        coins: 2000,
        perfectStandardQuizUnits: [],
        perfectBountyUnits: [],
        completedUnits: [],
        masteredUnits: []
      };
      const headers = { ...baseHeaders };
      if (upsertId.startsWith('anon_')) {
        headers['Set-Cookie'] = `mm_anon_id=${upsertId}; Path=/; Max-Age=31536000; SameSite=Lax`;
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          user: devUser,
          progress: [],
          serverTime: Date.now(),
          note: 'dev-fallback-upsert-exception',
          error: upsertErr.message,
          warning: 'Data not persisted - Supabase exception'
        }),
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

    // Reconstruct perfectStandardQuizUnits and perfectBountyUnits from progress table
    const perfectStandardQuizUnits = progressRows
      .filter((p) => p.perfect_standard_quiz === true)
      .map((p) => p.unit_id);
    const perfectBountyUnits = progressRows
      .filter((p) => p.perfect_bounty === true)
      .map((p) => p.unit_id);

    // Merge with existing user arrays (for backward compatibility)
    // IMPORTANT: Convert snake_case from Supabase to camelCase for frontend
    const mergedUser = {
      ...returnedUser,
      unlockedItems: Array.isArray(returnedUser.unlocked_items)
        ? returnedUser.unlocked_items
        : (Array.isArray(returnedUser.unlockedItems) ? returnedUser.unlockedItems : []),
      activeEffects: Array.isArray(returnedUser.active_effects)
        ? returnedUser.active_effects
        : (Array.isArray(returnedUser.activeEffects) ? returnedUser.activeEffects : []),
      calculatorSkin: returnedUser.calculator_skin || returnedUser.calculatorSkin || 'default',
      avatar: returnedUser.avatar || returnedUser.display_name?.[0] || '👤',
      preClearedUnits: Array.isArray(returnedUser.pre_cleared_units)
        ? returnedUser.pre_cleared_units
        : (Array.isArray(returnedUser.preClearedUnits) ? returnedUser.preClearedUnits : []),
      perfectStandardQuizUnits: [
        ...new Set([
          ...(returnedUser.perfectStandardQuizUnits || returnedUser.perfect_standard_quiz_units || []),
          ...perfectStandardQuizUnits
        ])
      ],
      perfectBountyUnits: [
        ...new Set([
          ...(returnedUser.perfectBountyUnits || returnedUser.perfect_bounty_units || []),
          ...perfectBountyUnits
        ])
      ],
      completedUnits: [
        ...new Set([
          ...(returnedUser.completedUnits || returnedUser.completed_units || []),
          ...progressRows.filter((p) => p.quest_completed_count > 0).map((p) => p.unit_id)
        ])
      ],
      masteredUnits: [
        ...new Set([
          ...(returnedUser.masteredUnits || returnedUser.mastered_units || []),
          ...progressRows.filter((p) => p.bounty_completed === true).map((p) => p.unit_id)
        ])
      ],
    };

    console.log('[me.js] Success:', { userId: upsertId, progressCount: progressRows.length });

    // Set cookie for anon ID persistence (if it's an anon ID)
    const headers = { ...baseHeaders };
    if (upsertId.startsWith('anon_')) {
      headers['Set-Cookie'] = `mm_anon_id=${upsertId}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        user: mergedUser,
        progress: progressRows || [],
        serverTime: Date.now(),
        tokenPayload: Object.keys(tokenPayload).length > 0 ? tokenPayload : undefined
      }),
    };
  } catch (err) {
    console.error('[me.js] Unhandled error:', err);
    // Even on error, try to return a dev fallback so the app doesn't break
    let fallbackUserId;
    try {
      fallbackUserId = getUserIdFromEvent(event);
    } catch (userIdErr) {
      console.error('[me.js] getUserIdFromEvent failed in catch:', userIdErr);
      // Generate a safe fallback ID
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      fallbackUserId = `anon_${timestamp}_${random}`;
    }

    if (!fallbackUserId || typeof fallbackUserId !== 'string') {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 9);
      fallbackUserId = `anon_${timestamp}_${random}`;
    }

    const devUser = {
      id: fallbackUserId,
      display_name: 'Dev',
      coins: 2000,
      perfectStandardQuizUnits: [],
      perfectBountyUnits: [],
      completedUnits: [],
      masteredUnits: []
    };
    const headers = { ...baseHeaders };
    if (fallbackUserId && typeof fallbackUserId === 'string' && fallbackUserId.startsWith('anon_')) {
      headers['Set-Cookie'] = `mm_anon_id=${fallbackUserId}; Path=/; Max-Age=31536000; SameSite=Lax`;
    }

    try {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          user: devUser,
          progress: [],
          serverTime: Date.now(),
          note: 'dev-fallback-error',
          error: err && err.message ? String(err.message) : 'Unknown error',
          warning: 'Data not persisted - Unhandled error'
        }),
      };
    } catch (stringifyErr) {
      console.error('[me.js] JSON.stringify failed:', stringifyErr);
      // Last resort: return minimal response
      return {
        statusCode: 500,
        headers: baseHeaders,
        body: JSON.stringify({
          ok: false,
          error: 'INTERNAL_ERROR',
          message: 'Failed to generate response'
        }),
      };
    }
  }
};
