-- Migration: Add AI persona and chat skin columns to users table
-- Date: 2025-01-XX

-- Add ai_persona column (default: 'insight')
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ai_persona TEXT DEFAULT 'insight';

-- Add ai_skin column (default: 'default')
ALTER TABLE users
ADD COLUMN IF NOT EXISTS ai_skin TEXT DEFAULT 'default';

-- Update existing users to have default values if NULL
UPDATE users
SET ai_persona = 'insight'
WHERE ai_persona IS NULL;

UPDATE users
SET ai_skin = 'default'
WHERE ai_skin IS NULL;

-- Add index for faster lookups (optional, but recommended)
CREATE INDEX IF NOT EXISTS idx_users_ai_persona ON users(ai_persona);
CREATE INDEX IF NOT EXISTS idx_users_ai_skin ON users(ai_skin);

