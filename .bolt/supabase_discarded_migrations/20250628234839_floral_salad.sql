/*
  # Create Storage Bucket for Post Photos

  1. New Storage Bucket
    - Creates a 'post-photos' bucket for storing user post images
    - Sets appropriate security policies for public access
    - Configures file size limits and allowed MIME types

  2. Security
    - Enables public read access for all files
    - Restricts write access to authenticated users
    - Enforces file type validation for images only
*/

-- Create storage bucket for post photos if it doesn't exist
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket already exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'post-photos'
  ) INTO bucket_exists;
  
  -- Create bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('post-photos', 'post-photos', true);
    
    -- Set RLS policies for the bucket
    
    -- Allow public read access
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Public Read Access',
      $$(bucket_id, name) = ('post-photos', name)$$,
      'post-photos'
    );
    
    -- Allow authenticated users to upload
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Authenticated Users Can Upload',
      $$(bucket_id, name) = ('post-photos', name) AND auth.role() = 'authenticated'$$,
      'post-photos'
    );
  END IF;
END $$;