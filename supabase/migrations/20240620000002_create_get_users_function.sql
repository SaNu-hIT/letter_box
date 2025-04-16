-- Create a function to get users from auth.users
CREATE OR REPLACE FUNCTION get_users()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    au.created_at,
    au.last_sign_in_at
  FROM 
    auth.users au
  ORDER BY 
    au.created_at DESC;
END;
$$ LANGUAGE plpgsql;
