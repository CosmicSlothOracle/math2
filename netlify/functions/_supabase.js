// Lightweight supabase client initializer for Netlify Functions
// Returns null if required env vars are missing or the client can't be created.
function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.log('[Supabase] Missing env vars - URL:', !!url, 'KEY:', !!key);
    return null;
  }
  try {
    // Try to require supabase-js - if it fails, return null (dev fallback)
    let supabaseLib;
    try {
      supabaseLib = require('@supabase/supabase-js');
    } catch (requireErr) {
      console.warn('[Supabase] Package not found, using dev fallback:', requireErr.message);
      return null;
    }
    if (!supabaseLib || !supabaseLib.createClient) {
      console.warn('[Supabase] createClient not found in package');
      return null;
    }
    return supabaseLib.createClient(url, key);
  } catch (err) {
    // supabase-js not installed or failed to load
    console.warn('[Supabase] Client init failed:', err && err.message);
    return null;
  }
}

module.exports = { createSupabaseClient };


