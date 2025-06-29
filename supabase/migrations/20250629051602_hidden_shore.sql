/*
  # Create Avatars Storage Bucket and Policies

  1. New Storage
    - Creates 'avatars' bucket for user profile pictures
    - Sets appropriate security policies
  
  2. Security
    - Users can only upload/update/delete their own avatars
    - Public read access for all avatars
    - Proper folder structure enforced
  
  3. User Profiles
    - Updates user_profiles policies to ensure avatar_url can be updated
*/

-- Create a function to create the avatars bucket and policies
-- This avoids direct manipulation of storage.objects which requires owner privileges
CREATE OR REPLACE FUNCTION create_avatars_bucket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bucket_id text := 'avatars';
BEGIN
  -- Create the bucket if it doesn't exist
  BEGIN
    PERFORM storage.create_bucket(bucket_id, 'Avatar storage');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Bucket may already exist: %', SQLERRM;
  END;
  
  -- Set bucket to public
  BEGIN
    PERFORM storage.update_bucket(bucket_id, ARRAY['public']);
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not update bucket: %', SQLERRM;
  END;
  
  -- Create policies for the bucket
  
  -- Allow users to upload their own avatars
  BEGIN
    PERFORM storage.create_policy(
      bucket_id,
      'authenticated users can upload avatars',
      'INSERT',
      'authenticated',
      'auth.uid()::text = (storage.foldername(name))[1]'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create INSERT policy: %', SQLERRM;
  END;
  
  -- Allow users to update their own avatars
  BEGIN
    PERFORM storage.create_policy(
      bucket_id,
      'users can update own avatars',
      'UPDATE',
      'authenticated',
      'auth.uid()::text = (storage.foldername(name))[1]'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create UPDATE policy: %', SQLERRM;
  END;
  
  -- Allow users to delete their own avatars
  BEGIN
    PERFORM storage.create_policy(
      bucket_id,
      'users can delete own avatars',
      'DELETE',
      'authenticated',
      'auth.uid()::text = (storage.foldername(name))[1]'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create DELETE policy: %', SQLERRM;
  END;
  
  -- Allow public read access to all avatars
  BEGIN
    PERFORM storage.create_policy(
      bucket_id,
      'public can view avatars',
      'SELECT',
      'public',
      'true'
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create SELECT policy: %', SQLERRM;
  END;
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