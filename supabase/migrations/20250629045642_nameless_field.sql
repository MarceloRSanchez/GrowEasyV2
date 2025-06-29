/*
  # Fix ambiguous email column reference in get_or_create_profile function

  1. Function Updates
    - Update `get_or_create_profile` function to properly qualify email column references
    - Ensure the function returns user profile data with email from auth.users table
    - Handle the case where profile doesn't exist and needs to be created

  2. Changes Made
    - Qualify email column reference as `auth.users.email` to remove ambiguity
    - Ensure proper JOIN between user_profiles and auth.users tables
    - Return consistent profile data structure
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_or_create_profile();

-- Create the corrected function with properly qualified column references
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- First, try to get existing profile
  RETURN QUERY
  SELECT 
    up.user_id,
    up.display_name,
    up.avatar_url,
    au.email  -- Explicitly qualify email from auth.users
  FROM user_profiles up
  JOIN auth.users au ON au.id = up.user_id
  WHERE up.user_id = auth.uid();

  -- If no profile exists, create one and return it
  IF NOT FOUND THEN
    -- Insert new profile
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (auth.uid(), NULL)
    ON CONFLICT (user_id) DO NOTHING;

    -- Return the newly created profile with user email
    RETURN QUERY
    SELECT 
      up.user_id,
      up.display_name,
      up.avatar_url,
      au.email  -- Explicitly qualify email from auth.users
    FROM user_profiles up
    JOIN auth.users au ON au.id = up.user_id
    WHERE up.user_id = auth.uid();
  END IF;
END;
$$;