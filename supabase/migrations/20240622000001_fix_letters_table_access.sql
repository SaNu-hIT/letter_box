-- Make sure RLS is disabled for letters table to allow admin access
ALTER TABLE IF EXISTS letters DISABLE ROW LEVEL SECURITY;

-- Create policy for admin access to letters table
DROP POLICY IF EXISTS "Admin has full access to letters" ON letters;
CREATE POLICY "Admin has full access to letters"
ON letters
USING (true);

-- Enable realtime for letters table
ALTER PUBLICATION supabase_realtime ADD TABLE letters;
