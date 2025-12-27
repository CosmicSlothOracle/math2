// Lightweight supabase client initializer for Netlify Functions
// Returns null if required env vars are missing or the client can't be created.
// Priority: SUPABASE_SERVICE_ROLE_KEY > SUPABASE_KEY > SUPABASE_ANON_KEY
function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  // Prefer Service Role Key for server-side operations (bypasses RLS)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? "SERVICE_ROLE"
    : process.env.SUPABASE_KEY
    ? "KEY"
    : process.env.SUPABASE_ANON_KEY
    ? "ANON"
    : "NONE";

  if (!url || !key) {
    console.log(
      "[Supabase] Missing env vars - URL:",
      !!url,
      "KEY_TYPE:",
      keyType
    );
    console.log(
      "[Supabase] Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Netlify Environment Variables"
    );
    return null;
  }

  try {
    // Try to require supabase-js - if it fails, return null (dev fallback)
    let supabaseLib;
    try {
      supabaseLib = require("@supabase/supabase-js");
    } catch (requireErr) {
      console.warn(
        "[Supabase] Package not found, using dev fallback:",
        requireErr.message
      );
      console.warn(
        "[Supabase] Install with: npm install @supabase/supabase-js"
      );
      return null;
    }
    if (!supabaseLib || !supabaseLib.createClient) {
      console.warn("[Supabase] createClient not found in package");
      return null;
    }

    // Create client with timeout settings to prevent hanging
    const client = supabaseLib.createClient(url, key, {
      auth: { persistSession: false },
      global: {
        fetch: (url, options = {}) => {
          // Add AbortController for timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
          return fetch(url, { ...options, signal: controller.signal }).finally(
            () => clearTimeout(timeoutId)
          );
        },
      },
    });
    console.log(
      "[Supabase] Client initialized successfully with key type:",
      keyType
    );
    return client;
  } catch (err) {
    // supabase-js not installed or failed to load
    console.warn("[Supabase] Client init failed:", err && err.message);
    return null;
  }
}

module.exports = { createSupabaseClient };
