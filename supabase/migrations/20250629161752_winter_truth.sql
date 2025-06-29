/*
  # Fix user_profiles table and constraints

  1. Database Changes
    - Create user_profiles table if it doesn't exist
    - Add display_name constraint with proper error handling
    - Enable RLS and create appropriate policies
    - Add documentation comment for avatar uploads

  2. Security
    - Ensure proper RLS policies for user profile management
    - Maintain user data privacy with appropriate access controls
*/

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT
);

-- Add constraint to display_name only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_profiles_display_name_check' 
    AND conrelid = 'user_profiles'::regclass
  ) THEN
    ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_display_name_check
    CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 20);
  END IF;
END $$;

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

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