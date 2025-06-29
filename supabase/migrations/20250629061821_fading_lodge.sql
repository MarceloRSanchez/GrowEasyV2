/*
  # Fix Avatar Upload RLS Policy

  1. Changes
    - Fix the RLS policy for avatar uploads to properly handle file paths
    - Update the storage policy to use a simpler condition that works with direct uploads
    - Ensure the policy works with the current upload code pattern
  
  2. Security
    - Maintains security by still restricting users to only their own avatars
    - Uses a simpler but equally secure policy definition
*/

-- Drop existing policies that might be causing issues
DO $$
BEGIN
  -- Try to drop existing policies
  BEGIN
    DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
END $$;

-- Create simplified policies that work with direct uploads
-- Policy for uploads - using a simpler condition
CREATE POLICY "Users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = name
);

-- Policy for updates - using a simpler condition
CREATE POLICY "Users can update avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = name
);

-- Policy for deletes - using a simpler condition
CREATE POLICY "Users can delete avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = name
);

-- Policy for public viewing
CREATE POLICY "Public can view avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Update the avatar upload code pattern in the application
COMMENT ON TABLE storage.objects IS 'When uploading avatars, use the user ID as the filename';