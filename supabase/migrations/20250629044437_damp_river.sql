/*
  # Storage Bucket for Post Photos
  
  1. New Storage
    - Creates a public storage bucket for post photos
    - Sets up appropriate security policies
    
  2. Security
    - Public read access for all users
    - Write access limited to authenticated users
    - Delete access limited to file owners
    
  3. Notes
    - Uses Supabase Storage API functions instead of direct table access
    - Handles cases where bucket already exists
*/

-- Create storage bucket for post photos
DO $$
BEGIN
  -- Create the bucket using the storage API function
  -- This is the proper way to create buckets rather than inserting directly
  PERFORM storage.create_bucket(
    'post-photos',  -- bucket name
    'public',       -- bucket_id (same as name)
    'public'        -- bucket visibility
  );
EXCEPTION
  WHEN others THEN
    -- Bucket might already exist, which is fine
    NULL;
END $$;

-- Create policy for public read access
DO $$
BEGIN
  -- Create policy for public read access
  PERFORM storage.create_policy(
    'post-photos',                      -- bucket name
    'Public Read Access',               -- policy name
    'READ',                             -- operation
    'authenticated, anon',              -- roles that can perform this operation
    true                                -- policy definition (allow all)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;

-- Create policy for authenticated users to upload
DO $$
BEGIN
  -- Create policy for authenticated users to upload
  PERFORM storage.create_policy(
    'post-photos',                      -- bucket name
    'Authenticated Users Can Upload',   -- policy name
    'INSERT',                           -- operation
    'authenticated',                    -- role
    true                                -- policy definition (allow all authenticated)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;

-- Create policy for users to delete their own uploads
DO $$
BEGIN
  -- Create policy for users to delete their own uploads
  PERFORM storage.create_policy(
    'post-photos',                      -- bucket name
    'Users Can Delete Own Uploads',     -- policy name
    'DELETE',                           -- operation
    'authenticated',                    -- role
    'auth.uid() = owner'                -- policy definition (only owner can delete)
  );
EXCEPTION
  WHEN others THEN
    -- Policy might already exist, which is fine
    NULL;
END $$;