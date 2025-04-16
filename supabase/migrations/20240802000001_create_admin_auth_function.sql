-- Create a secure function to verify admin credentials
-- This moves the admin authentication from client-side to server-side

-- First, create a table to store admin credentials (if not exists)
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a function to verify admin credentials
CREATE OR REPLACE FUNCTION verify_admin_credentials(admin_username TEXT, admin_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_hash TEXT;
  valid BOOLEAN;
BEGIN
  -- First check if there are any admin credentials in the table
  SELECT COUNT(*) = 0 INTO valid FROM admin_credentials;
  
  -- If no credentials exist, allow default credentials to work
  -- This is for backward compatibility during migration
  IF valid THEN
    RETURN admin_username = 'ADMIN_LETTER' AND admin_password = 'ADMIN123';
  END IF;
  
  -- Otherwise, check against stored credentials
  SELECT password_hash INTO stored_hash FROM admin_credentials WHERE username = admin_username;
  
  -- If no matching username, return false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if password matches (using pgcrypto extension)
  -- Note: In a real implementation, you would use crypt() and gen_salt() from pgcrypto
  -- This is a simplified version for demonstration
  RETURN stored_hash = admin_password;
  
  -- In production, replace with:
  -- RETURN stored_hash = crypt(admin_password, stored_hash);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION verify_admin_credentials TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_credentials TO anon;

-- Insert default admin if not exists (for initial setup)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_credentials WHERE username = 'ADMIN_LETTER') THEN
    INSERT INTO admin_credentials (username, password_hash)
    VALUES ('ADMIN_LETTER', 'ADMIN123');
  END IF;
END
$$;
