Netlify + Supabase — Local Dev and Deploy Setup

This project uses Netlify Functions for the minimal backend and Supabase as the recommended hosted DB. The section below explains how to run locally with `netlify dev` and which environment variables are needed for full Supabase integration.

1) Install Netlify CLI (if not already):
   npm install -g netlify-cli

2) Run local dev (no Supabase required for dev fallback):
   netlify dev

   - With no SUPABASE env vars and without Authorization header the `/me` function will return a dev fallback user:
     { user: { id: "dev-user", display_name: "Dev", coins: 2000 }, progress: [] }

3) To enable Supabase-backed behavior (recommended in staging/production), set the following environment variables in Netlify (UI or CLI) or your local environment:
   - SUPABASE_URL — your Supabase project URL (e.g. https://abcd.supabase.co)
   - SUPABASE_SERVICE_ROLE_KEY — service role key with write privileges (server-side only)

   Optionally, you may set:
   - SUPABASE_ANON_KEY — anon key (read-only) — not recommended for server-side writes

4) Netlify Identity (optional)
   - To authenticate requests from the frontend, enable Netlify Identity in your Netlify site settings.
   - The frontend should pass the Identity JWT as `Authorization: Bearer <token>` to functions.

5) Notes & Troubleshooting
   - If `@supabase/supabase-js` is not installed, the function will return an error indicating the client couldn't be initialized. Install it with:
       npm install @supabase/supabase-js

   - The `/api/me` function performs only a minimal token payload decode to extract a user id (sub) or email. It does not verify the JWT signature locally — rely on Netlify Identity + Supabase RLS for production security.

6) Example `netlify.toml` (already present in repo — adjust functions directory)
   [dev]
     functions = "netlify/functions"

Function endpoints (available under `/.netlify/functions/` when running locally):
- `me` — GET bootstrap: returns { user, progress, serverTime }
- `progressGet` — GET ?unitId=... : returns progress rows for current user
- `progressSave` — POST { unitId, questCoinsEarned, questCompletedCount, bountyCompleted } : upsert progress row
- `coinsAdjust` — POST { delta, reason, refType?, refId? } : server-authoritative coin update; returns { coins, applied }

That's it — start `netlify dev` and visit `/.netlify/functions/me` to see the JSON response. In dev mode (no envs) you'll get a safe dev user.


