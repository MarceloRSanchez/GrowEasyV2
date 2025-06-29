/*
  # Fix get_or_create_profile function and create avatars bucket

  1. Database Functions
    - Fix the `get_or_create_profile` function to resolve ambiguous column references
    - Ensure proper table qualification and use auth.uid() for current user

  2. Storage
    - Create the `avatars` storage bucket
    - Set up proper RLS policies for avatar uploads

  3. Security
    - Enable RLS on avatars bucket
    - Add policies for authenticated users to upload and read avatars
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_or_create_profile();

-- Create the corrected get_or_create_profile function
CREATE OR REPLACE FUNCTION get_or_create_profile()
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current authenticated user's ID
  current_user_id := auth.uid();
  
  -- Check if current_user_id is null (user not authenticated)
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Try to get existing profile
  RETURN QUERY
  SELECT 
    up.user_id,
    up.display_name,
    up.avatar_url
  FROM user_profiles up
  WHERE up.user_id = current_user_id;

  -- If no profile exists, create one and return it
  IF NOT FOUND THEN
    INSERT INTO user_profiles (user_id, display_name, avatar_url)
    VALUES (current_user_id, NULL, NULL);
    
    RETURN QUERY
    SELECT 
      up.user_id,
      up.display_name,
      up.avatar_url
    FROM user_profiles up
    WHERE up.user_id = current_user_id;
  END IF;
END;
$$;

-- Create the avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the avatars bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'avatars';

-- Create policy for authenticated users to upload avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for anyone to view avatars
CREATE POLICY "Avatars are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Create policy for users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy for users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);