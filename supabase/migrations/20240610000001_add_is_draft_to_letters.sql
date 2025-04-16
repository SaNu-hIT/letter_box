-- Add is_draft column to letters table
ALTER TABLE letters ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT false;
