// Debug function to check Supabase configuration
// Usage: GET /.netlify/functions/debugSupabase

const { createSupabaseClient } = require('./_supabase.cjs');

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

  const debug = {
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      SUPABASE_KEY: process.env.SUPABASE_KEY ? 'SET' : 'MISSING',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      NETLIFY_DEV: process.env.NETLIFY_DEV || 'not set',
    },
    client: {
      created: false,
      error: null,
      testQuery: null,
    },
  };

  // Try to create client
  try {
    const client = createSupabaseClient();
    if (client) {
      debug.client.created = true;

      // Try a simple query to verify connection
      try {
        const { data, error } = await client.from('users').select('id').limit(1);
        if (error) {
          debug.client.testQuery = {
            success: false,
            error: error.message,
            code: error.code,
          };
        } else {
          debug.client.testQuery = {
            success: true,
            rowCount: data ? data.length : 0,
          };
        }
      } catch (queryErr) {
        debug.client.testQuery = {
          success: false,
          error: queryErr.message,
        };
      }

      // Test if unlocked_items column exists (common missing column)
      try {
        const { data: schemaData, error: schemaError } = await client
          .from('users')
          .select('id, coins, unlocked_items')
          .limit(1);

        debug.schema = {
          unlocked_items_exists: !schemaError,
          error: schemaError ? schemaError.message : null,
        };

        if (schemaError && schemaError.message.includes('unlocked_items')) {
          debug.schema.fix = 'Run: ALTER TABLE users ADD COLUMN unlocked_items text[] DEFAULT ARRAY[]::text[];';
        }
      } catch (schemaErr) {
        debug.schema = {
          unlocked_items_exists: false,
          error: schemaErr.message,
        };
      }

      // Count tables for verification
      try {
        const tables = ['users', 'progress', 'messages', 'coin_ledger'];
        debug.tables = {};
        for (const table of tables) {
          const { count, error: countErr } = await client
            .from(table)
            .select('*', { count: 'exact', head: true });
          debug.tables[table] = countErr ? { error: countErr.message } : { count };
        }
      } catch (tableErr) {
        debug.tables = { error: tableErr.message };
      }
    } else {
      debug.client.error = 'createSupabaseClient returned null';
    }
  } catch (err) {
    debug.client.error = err.message;
    debug.client.stack = err.stack;
  }

  // Check if @supabase/supabase-js is available
  try {
    const supabaseLib = require('@supabase/supabase-js');
    debug.package = {
      installed: true,
      hasCreateClient: typeof supabaseLib.createClient === 'function',
    };
  } catch (requireErr) {
    debug.package = {
      installed: false,
      error: requireErr.message,
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      debug,
      recommendations: generateRecommendations(debug),
    }),
  };
};

function generateRecommendations(debug) {
  const recs = [];

  if (debug.env.SUPABASE_URL === 'MISSING') {
    recs.push('Set SUPABASE_URL in Netlify Environment Variables');
  }

  if (debug.env.SUPABASE_SERVICE_ROLE_KEY === 'MISSING' &&
      debug.env.SUPABASE_KEY === 'MISSING' &&
      debug.env.SUPABASE_ANON_KEY === 'MISSING') {
    recs.push('Set at least one Supabase key (SUPABASE_SERVICE_ROLE_KEY recommended) in Netlify Environment Variables');
  }

  if (!debug.package.installed) {
    recs.push('Install @supabase/supabase-js: npm install @supabase/supabase-js');
  }

  if (!debug.client.created) {
    recs.push('Supabase client could not be created. Check env vars and package installation.');
  }

  if (debug.client.testQuery && !debug.client.testQuery.success) {
    recs.push(`Supabase connection test failed: ${debug.client.testQuery.error}`);
    if (debug.client.testQuery.code === 'PGRST116') {
      recs.push('Possible RLS issue - check Supabase RLS policies or use SERVICE_ROLE_KEY');
    }
  }

  // Schema recommendations
  if (debug.schema && !debug.schema.unlocked_items_exists) {
    recs.push('🚨 CRITICAL: unlocked_items column missing in users table!');
    recs.push('Fix: Run docs/migration_fix_schema.sql in Supabase SQL Editor');
    if (debug.schema.fix) {
      recs.push(debug.schema.fix);
    }
  }

  if (recs.length === 0) {
    recs.push('✅ Supabase configuration looks good!');
  }

  return recs;
}

