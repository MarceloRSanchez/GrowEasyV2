/*
  # Create Storage Bucket for Post Photos

  1. New Storage Bucket
    - Creates a 'post-photos' bucket for storing community post images
    - Sets public access for the bucket
  
  2. Security
    - Uses Supabase Storage API functions instead of direct table access
    - Properly handles bucket creation and policy setup
*/

-- Enable the storage extension if not already enabled
--CREATE EXTENSION IF NOT EXISTS "pg_storage";

-- Create storage bucket for post photos if it doesn't exist
SELECT storage.create_bucket('post-photos', 'Public bucket for post photos', 'public');

-- Set up public read access policy
SELECT storage.create_policy(
  'post-photos', 
  'Public Read Access', 
  'READ', 
  'public', 
  true, 
  true
);

-- Set up authenticated upload policy
SELECT storage.create_policy(
  'post-photos', 
  'Authenticated Users Can Upload', 
  'INSERT', 
  'authenticated', 
  true, 
  true
);

-- Set up authenticated delete policy (users can only delete their own uploads)
SELECT storage.create_policy(
  'post-photos', 
  'Users Can Delete Own Uploads', 
  'DELETE', 
  'authenticated', 
  'auth.uid() = owner', 
  true
);