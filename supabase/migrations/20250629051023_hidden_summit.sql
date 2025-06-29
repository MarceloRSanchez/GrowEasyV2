/*
  # Fix RLS policy for user profiles avatar uploads

  1. Security Updates
    - Drop existing RLS policy that uses incorrect uid() function
    - Create new RLS policy using correct auth.uid() function
    - Ensure authenticated users can update their own profiles

  2. Changes
    - Replace uid() with auth.uid() in RLS policy
    - Maintain same security model but with correct function reference
*/

-- Drop the existing policy that uses uid()
DROP POLICY IF EXISTS "Users can read/write their own profile" ON user_profiles;

-- Create new policies with correct auth.uid() function
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