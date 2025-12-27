import { createClient, SupabaseClient } from '@supabase/supabase-js';

let realtimeClient: SupabaseClient | null = null;

const getEnv = (key: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key as keyof typeof import.meta.env]) {
    return import.meta.env[key as keyof typeof import.meta.env] as string;
  }
  if (typeof window !== 'undefined' && (window as any)[key]) {
    return (window as any)[key];
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

