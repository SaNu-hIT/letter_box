-- Add is_admin column to auth.users
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT is_admin FROM auth.users WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on the letters table
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to see all letters
DROP POLICY IF EXISTS "Admins can see all letters" ON public.letters;
CREATE POLICY "Admins can see all letters"
  ON public.letters
  FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Create policy for users to see only their own letters
DROP POLICY IF EXISTS "Users can see their own letters" ON public.letters;
CREATE POLICY "Users can see their own letters"
  ON public.letters
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Letters table is already in supabase_realtime publication
