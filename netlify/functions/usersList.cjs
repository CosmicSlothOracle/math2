const { createSupabaseClient } = require('./_supabase.cjs');

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ ok: true }) };
  }

  try {
    const supabase = createSupabaseClient();

    if (!supabase) {
      console.warn('[usersList] Dev fallback - Supabase unavailable');
      return {
        statusCode: 200,
        headers: HEADERS,
        body: JSON.stringify({
          ok: true,
          users: [
            {
              id: 'dev-user-1',
              display_name: 'TestUser1',
              coins: 1500,
              avatar: '🦉',
              active_effects: [],
              created_at: new Date().toISOString(),
              battle_stats: { total: 5, wins: 3, win_rate: 60 },
            },
            {
              id: 'dev-user-2',
              display_name: 'TestUser2',
              coins: 800,
              avatar: '🥷',
              active_effects: [],
              created_at: new Date().toISOString(),
              battle_stats: { total: 2, wins: 1, win_rate: 50 },
            },
          ],
          note: 'dev-fallback',
        }),
      };
    }

    // Fetch all users with unique display names
    // Only query core columns that definitely exist: id, display_name, coins, created_at
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, display_name, coins, created_at')
      .not('display_name', 'is', null)
      .order('coins', { ascending: false });

    if (usersError) {
      console.error('[usersList] Users query failed:', usersError);
      return {
        statusCode: 500,
        headers: HEADERS,
        body: JSON.stringify({ ok: false, error: 'USERS_QUERY_FAILED', details: usersError.message }),
      };
    }

    // Filter out empty display names in JavaScript (more reliable than .neq('', ''))
    // This avoids the Supabase query error with empty string comparisons
    const filteredUsers = (users || []).filter(u => u.display_name && u.display_name.trim().length > 0);

    // Fetch battle stats for each user
    const usersWithStats = await Promise.all(
      filteredUsers.map(async (user) => {
        // Get battles where user is challenger or opponent
        const { data: battles, error: battlesError } = await supabase
          .from('battles')
          .select('id, challenger_id, opponent_id, winner_id, status')
          .or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`)
          .eq('status', 'finished');

        if (battlesError) {
          console.warn(`[usersList] Battle stats failed for user ${user.id}:`, battlesError.message);
          return {
            ...user,
            battle_stats: { total: 0, wins: 0, win_rate: 0 },
          };
        }

        const total = battles?.length || 0;
        const wins = battles?.filter((b) => b.winner_id === user.id).length || 0;
        const win_rate = total > 0 ? Math.round((wins / total) * 100) : 0;

        return {
          ...user,
          avatar: '👤', // Default avatar
          active_effects: [],
          completed_units: [],
          mastered_units: [],
          perfect_bounty_units: [],
          battle_stats: { total, wins, win_rate },
        };
      })
    );

    return {
      statusCode: 200,
      headers: HEADERS,
      body: JSON.stringify({
        ok: true,
        users: usersWithStats,
      }),
    };
  } catch (err) {
    console.error('[usersList] Unexpected error:', err);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ ok: false, error: 'INTERNAL_ERROR', message: err.message }),
    };
  }
};

