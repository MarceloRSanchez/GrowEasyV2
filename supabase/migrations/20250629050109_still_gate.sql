/*
  # Fix get_or_create_profile function

  1. Database Changes
    - Fix the get_or_create_profile function to properly match return type
    - Ensure column types match exactly between function definition and query result
  
  2. Security
    - Maintains existing security definer setting
    - Function remains accessible to authenticated users
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_or_create_profile();

-- Create the corrected function with proper return types
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
    au.email::text  -- Cast email to text to ensure type match
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
      au.email::text  -- Cast email to text to ensure type match
    FROM user_profiles up
    JOIN auth.users au ON au.id = up.user_id
    WHERE up.user_id = auth.uid();
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_profile() TO authenticated;