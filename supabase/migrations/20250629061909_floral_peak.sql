/*
  # Fix Avatar Storage Policies

  1. New Features
    - Create user_profiles table if it doesn't exist
    - Add avatar_url column to user_profiles
    - Create RLS policies for user_profiles table
  
  2. Security
    - Ensure users can only update their own profiles
    - Ensure users can only read their own profiles
    - Ensure users can only delete their own profiles
  
  3. Notes
    - Avoids direct manipulation of storage.objects table which requires owner privileges
    - Storage bucket and policies should be created through Supabase Dashboard instead
*/

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT
);

-- Add constraint to display_name
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_display_name_check
CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 20);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can read their own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON user_profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own profile"
ON user_profiles
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Add comment with instructions for avatar uploads
COMMENT ON TABLE user_profiles IS 'User profile information including avatar URLs. For avatar uploads, use the Supabase Storage API with the user ID as the filename.';