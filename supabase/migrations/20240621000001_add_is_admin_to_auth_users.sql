-- Add is_admin column to auth.users if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'auth' 
                   AND table_name = 'users' 
                   AND column_name = 'is_admin') THEN
        ALTER TABLE auth.users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Update the policy to use a safer approach
DROP POLICY IF EXISTS "Admin has full access" ON users;
CREATE POLICY "Admin has full access"
ON users
USING (
  (SELECT is_admin FROM auth.users WHERE id = auth.uid()) = TRUE
);
