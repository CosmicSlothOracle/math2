-- Migration: Add username column to messages table
-- Run this in Supabase SQL Editor if the column doesn't exist yet

-- Add username column if it doesn't exist
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS username text;

-- Verify column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
  AND column_name = 'username';

