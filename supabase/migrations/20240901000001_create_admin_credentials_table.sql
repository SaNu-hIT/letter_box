-- Create admin_credentials table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
DROP POLICY IF EXISTS "Admin users can read admin_credentials";
CREATE POLICY "Admin users can read admin_credentials"
ON admin_credentials FOR SELECT
USING (auth.uid() IN (SELECT id FROM users WHERE is_admin = true));

-- Add to realtime publication
alter publication supabase_realtime add table admin_credentials;

-- Insert a default admin user if the table is empty
INSERT INTO admin_credentials (username, password)
SELECT 'admin', 'admin123'
WHERE NOT EXISTS (SELECT 1 FROM admin_credentials);