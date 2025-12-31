// Diagnostic endpoint to help diagnose API errors
// Usage: GET /.netlify/functions/diagnose

const { createSupabaseClient } = require('./_supabase.cjs');
const { getUserIdFromEvent } = require('./_utils.cjs');

exports.handler = async function (event, context) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dev-user, x-anon-id',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeVersion: process.version,
      netlifyDev: process.env.NETLIFY_DEV || 'false',
      region: process.env.AWS_REGION || 'unknown',
    },
    supabase: {
      url: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      anonKey: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      clientCreated: false,
      testQuery: null,
    },
    user: {
      userId: null,
      extractionError: null,
    },
    packages: {
      supabaseJs: null,
    },
    recommendations: [],
  };

  // Test User ID extraction
  try {
    diagnostics.user.userId = getUserIdFromEvent(event);
  } catch (err) {
    diagnostics.user.extractionError = err.message;
  }

  // Test Supabase Client
  try {
    const supabase = createSupabaseClient();
    if (supabase) {
      diagnostics.supabase.clientCreated = true;

      // Test query
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .limit(1);

        if (error) {
          diagnostics.supabase.testQuery = {
            success: false,
            error: error.message,
            code: error.code,
            details: error.details,
          };
        } else {
          diagnostics.supabase.testQuery = {
            success: true,
            rowCount: data ? data.length : 0,
          };
        }
      } catch (queryErr) {
        diagnostics.supabase.testQuery = {
          success: false,
          error: queryErr.message,
        };
      }
    }
  } catch (clientErr) {
    diagnostics.supabase.clientError = clientErr.message;
  }

  // Check packages
  try {
    const supabaseLib = require('@supabase/supabase-js');
    diagnostics.packages.supabaseJs = {
      installed: true,
      hasCreateClient: typeof supabaseLib.createClient === 'function',
    };
  } catch (requireErr) {
    diagnostics.packages.supabaseJs = {
      installed: false,
      error: requireErr.message,
    };
  }

  try {
    const genaiLib = require('@google/genai');
    diagnostics.packages.genai = {
      installed: true,
      hasGoogleGenAI: typeof genaiLib.GoogleGenAI === 'function',
    };
  } catch (requireErr) {
    diagnostics.packages.genai = {
      installed: false,
      error: requireErr.message,
    };
  }

  // Generate recommendations
  if (diagnostics.supabase.url === 'MISSING') {
    diagnostics.recommendations.push('Set SUPABASE_URL in Netlify Environment Variables');
  }

  if (diagnostics.supabase.serviceRoleKey === 'MISSING' && diagnostics.supabase.anonKey === 'MISSING') {
    diagnostics.recommendations.push('Set SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in Netlify Environment Variables');
  }

  if (!diagnostics.packages.supabaseJs?.installed) {
    diagnostics.recommendations.push('Install @supabase/supabase-js: npm install @supabase/supabase-js');
  }

  if (!diagnostics.supabase.clientCreated) {
    diagnostics.recommendations.push('Supabase client could not be created - check env vars and package installation');
  }

  if (diagnostics.supabase.testQuery && !diagnostics.supabase.testQuery.success) {
    diagnostics.recommendations.push(`Supabase test query failed: ${diagnostics.supabase.testQuery.error}`);
    if (diagnostics.supabase.testQuery.code === 'PGRST116') {
      diagnostics.recommendations.push('Possible RLS issue - use SUPABASE_SERVICE_ROLE_KEY to bypass RLS');
    }
  }

  if (diagnostics.recommendations.length === 0) {
    diagnostics.recommendations.push('✅ Configuration looks good!');
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      ok: true,
      diagnostics,
    }),
  };
};

