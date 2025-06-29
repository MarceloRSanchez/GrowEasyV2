/*
  # Storage Bucket and RLS Policies for User Avatars
  
  1. New Features
    - Create 'avatars' storage bucket for user profile pictures
    - Set up proper RLS policies for secure avatar management
  
  2. Security
    - Public read access to avatars
    - Authenticated users can only manage their own avatars
    - User ID-based path structure for avatar storage
  
  3. User Profiles
    - Update policy for user_profiles to ensure avatar_url can be updated
*/

-- Create a function to create the avatars bucket and policies
-- This avoids direct manipulation of storage.objects which requires owner privileges
CREATE OR REPLACE FUNCTION create_avatars_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create the bucket if it doesn't exist
  PERFORM storage.create_bucket('avatars', 'Avatar storage');
  
  -- Set bucket to public
  PERFORM storage.update_bucket('avatars', ARRAY['public']);
  
  -- Create policies for the bucket
  
  -- Allow users to upload their own avatars
  PERFORM storage.create_policy(
    'avatars',
    'authenticated users can upload avatars',
    'INSERT',
    'authenticated',
    storage.foldername(name)[1]::uuid = auth.uid()
  );
  
  -- Allow users to update their own avatars
  PERFORM storage.create_policy(
    'avatars',
    'users can update own avatars',
    'UPDATE',
    'authenticated',
    storage.foldername(name)[1]::uuid = auth.uid()
  );
  
  -- Allow users to delete their own avatars
  PERFORM storage.create_policy(
    'avatars',
    'users can delete own avatars',
    'DELETE',
    'authenticated',
    storage.foldername(name)[1]::uuid = auth.uid()
  );
  
  -- Allow public read access to all avatars
  PERFORM storage.create_policy(
    'avatars',
    'public can view avatars',
    'SELECT',
    'public',
    true
  );
END;
$$;

-- Execute the function to create the bucket and policies
SELECT create_avatars_bucket();

-- Drop the function after use
DROP FUNCTION create_avatars_bucket();

-- Ensure user_profiles table has proper UPDATE policy for avatar_url
-- Drop existing policy if it exists and recreate it
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());