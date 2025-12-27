import { createClient, SupabaseClient } from '@supabase/supabase-js';

let realtimeClient: SupabaseClient | null = null;

const getEnv = (key: string): string | undefined => {
  // Cast import.meta.env to a generic record to avoid inline TS assertions in the bracket access
  const env = import.meta.env as Record<string, string | undefined>;
  if (typeof import.meta !== 'undefined' && env && env[key]) {
    return env[key];
  }
  return undefined;
};

export function getRealtimeClient(): SupabaseClient | null {
  if (realtimeClient) return realtimeClient;

  const url = getEnv('VITE_SUPABASE_URL');
  const anonKey = getEnv('VITE_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    console.warn('[Realtime] Missing SUPABASE env (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
    return null;
  }

  realtimeClient = createClient(url, anonKey, {
    auth: { persistSession: false },
    realtime: {
      params: {
        eventsPerSecond: 5,
      },
    },
  });

  return realtimeClient;
}

