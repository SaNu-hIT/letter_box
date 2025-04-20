-- Fix admin_credentials table structure
ALTER TABLE IF EXISTS admin_credentials
ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT 'admin123';

-- Update any existing records to use password_hash instead of password
UPDATE admin_credentials
SET password_hash = 'admin123'
WHERE password_hash IS NULL;
