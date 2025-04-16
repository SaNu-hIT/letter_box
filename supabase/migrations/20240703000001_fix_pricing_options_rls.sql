-- Disable RLS for pricing_options table
ALTER TABLE pricing_options DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow full access" ON pricing_options;

-- Create a policy that allows all operations for authenticated users
CREATE POLICY "Allow full access"
ON pricing_options
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
