-- Migration: Add login_name column to users table
-- Run this in Supabase SQL editor if the users table already exists

-- Step 1: Add login_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name = 'login_name'
    ) THEN
        ALTER TABLE users ADD COLUMN login_name text;
    END IF;
END $$;

-- Step 2: Create unique index on login_name (only for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_login_name
ON users(login_name)
WHERE login_name IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'login_name';

