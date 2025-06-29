/*
  # Create Storage Bucket for Post Photos

  1. New Storage
    - Creates a 'post-photos' bucket for storing community post images
    - Configures public read access for all users
    - Restricts upload permissions to authenticated users only
  
  2. Security
    - Public read access for all images
    - Write access limited to authenticated users
    - Each user can only access their own uploads
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
  END IF;
END $$;

-- Set up public read access policy
DO $$
BEGIN
  INSERT INTO storage.policies (name, definition, bucket_id, operation)
  VALUES (
    'Public Read Access',
    'bucket_id = ''post-photos''',
    'post-photos',
    'READ'
  );
EXCEPTION
  WHEN unique_violation THEN
    -- Policy already exists, ignore
    NULL;
END $$;

-- Set up authenticated upload policy
DO $$
BEGIN
  INSERT INTO storage.policies (name, definition, bucket_id, operation)
  VALUES (
    'Authenticated Users Can Upload',
    'bucket_id = ''post-photos'' AND auth.role() = ''authenticated''',
    'post-photos',
    'INSERT'
  );
EXCEPTION
  WHEN unique_violation THEN
    -- Policy already exists, ignore
    NULL;
END $$;

-- Set up authenticated delete policy (users can only delete their own uploads)
DO $$
BEGIN
  INSERT INTO storage.policies (name, definition, bucket_id, operation)
  VALUES (
    'Users Can Delete Own Uploads',
    'bucket_id = ''post-photos'' AND auth.uid() = owner',
    'post-photos',
    'DELETE'
  );
EXCEPTION
  WHEN unique_violation THEN
    -- Policy already exists, ignore
    NULL;
END $$;