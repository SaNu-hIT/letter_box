-- Create a secure function to verify admin credentials
CREATE OR REPLACE FUNCTION verify_admin_credentials(admin_username TEXT, admin_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
  is_admin BOOLEAN;
BEGIN
  -- Get the user ID from auth.users based on email (username)
  SELECT id INTO user_id FROM auth.users WHERE email = admin_username;
  
  -- If no user found, return false
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the user has admin privileges
  SELECT u.is_admin INTO is_admin FROM public.users u WHERE u.id = user_id;
  
  -- Return true only if the user is an admin
  RETURN COALESCE(is_admin, FALSE);
END;
$$;

-- Create a function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Get the is_admin flag for the current user
  SELECT u.is_admin INTO is_admin 
  FROM public.users u 
  WHERE u.id = auth.uid();
  
  -- Return the result, defaulting to false if null
  RETURN COALESCE(is_admin, FALSE);
END;
$$;
