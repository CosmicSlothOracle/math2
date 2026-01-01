-- Migration: Disable RLS on users table for server-side operations
-- Run this in Supabase SQL Editor if you get "row-level security policy" errors
--
-- IMPORTANT: This allows the Service Role Key (used by Netlify Functions)
-- to insert/update users without RLS restrictions.
--
-- The Service Role Key should bypass RLS automatically, but if RLS is
-- enabled without any policies, it can still block operations.

-- Option 1: Disable RLS completely (recommended for server-side operations)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Option 2: If you want to keep RLS enabled, create policies that allow
-- Service Role Key to perform operations (uncomment if needed):
--
-- CREATE POLICY "Allow service role full access" ON users
--   FOR ALL
--   USING (true)
--   WITH CHECK (true);

-- Verify RLS status
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'users';

