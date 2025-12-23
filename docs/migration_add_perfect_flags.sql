-- Migration: Add perfect_standard_quiz and perfect_bounty columns to progress table
-- Run this in Supabase SQL Editor if the columns don't exist yet

-- Add columns if they don't exist
ALTER TABLE progress
ADD COLUMN IF NOT EXISTS perfect_standard_quiz boolean DEFAULT false;

ALTER TABLE progress
ADD COLUMN IF NOT EXISTS perfect_bounty boolean DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_progress_perfect_standard
ON progress(user_id, perfect_standard_quiz)
WHERE perfect_standard_quiz = true;

CREATE INDEX IF NOT EXISTS idx_progress_perfect_bounty
ON progress(user_id, perfect_bounty)
WHERE perfect_bounty = true;

-- Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'progress'
  AND column_name IN ('perfect_standard_quiz', 'perfect_bounty');

