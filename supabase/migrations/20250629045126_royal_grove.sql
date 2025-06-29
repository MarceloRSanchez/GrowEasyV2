/*
  # User Profiles Table

  1. New Table
    - `user_profiles` - Stores user display name and avatar URL
    - Primary key references auth.users for 1:1 relationship
    - Display name has length validation (2-20 chars)
  
  2. Security
    - Enable RLS on user_profiles table
    - Add policy for users to manage their own profile
    
  3. Storage
    - Create avatars bucket for profile pictures
    - Set up appropriate storage policies
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT CHECK (char_length(display_name) BETWEEN 2 AND 20),
  avatar_url TEXT
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for user profiles
CREATE POLICY "Users can read/write their own profile"
  ON user_profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create storage bucket for avatars
DO $$
BEGIN
  -- Create the bucket using the storage API function
  PERFORM storage.create_bucket(
    'avatars',       -- bucket name
    'avatars',       -- bucket_id
    'public'         -- bucket visibility
  );
EXCEPTION
  WHEN others THEN
    -- Bucket might already exist, which is fine
    NULL;
END $$;

-- Create policy for public read access to avatars
DO $$
BEGIN
  PERFORM storage.create_policy(
    'avatars',                         -- bucket name
    'Public Read Access',              -- policy name
    'READ',                            -- operation
    'authenticated, anon',             -- roles that can perform this operation
    true                               -- policy definition (allow all)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;

-- Create policy for authenticated users to upload avatars
DO $$
BEGIN
  PERFORM storage.create_policy(
    'avatars',                         -- bucket name
    'Authenticated Users Can Upload',  -- policy name
    'INSERT',                          -- operation
    'authenticated',                   -- role
    true                               -- policy definition (allow all authenticated)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;

-- Create policy for users to update their own avatars
DO $$
BEGIN
  PERFORM storage.create_policy(
    'avatars',                         -- bucket name
    'Users Can Update Own Avatars',    -- policy name
    'UPDATE',                          -- operation
    'authenticated',                   -- role
    'auth.uid()::text = name'          -- policy definition (only owner can update)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;

-- Create policy for users to delete their own avatars
DO $$
BEGIN
  PERFORM storage.create_policy(
    'avatars',                         -- bucket name
    'Users Can Delete Own Avatars',    -- policy name
    'DELETE',                          -- operation
    'authenticated',                   -- role
    'auth.uid()::text = name'          -- policy definition (only owner can delete)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;

-- Create function to get or create user profile
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
  v_profile_exists BOOLEAN;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Get user email
  SELECT email INTO v_email FROM auth.users WHERE id = v_user_id;
  
  -- Check if profile exists
  SELECT EXISTS (
    SELECT 1 FROM user_profiles WHERE user_id = v_user_id
  ) INTO v_profile_exists;
  
  -- Create profile if it doesn't exist
  IF NOT v_profile_exists THEN
    INSERT INTO user_profiles (user_id)
    VALUES (v_user_id);
  END IF;
  
  -- Return profile data
  RETURN QUERY
  SELECT
    up.user_id,
    up.display_name,
    up.avatar_url,
    v_email
  FROM
    user_profiles up
  WHERE
    up.user_id = v_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_or_create_profile() TO authenticated;