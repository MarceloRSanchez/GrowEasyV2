/*
  # Fix get_feed_posts function type mismatch

  1. Database Changes
    - Fix the get_feed_posts function to properly handle type casting
    - Ensure display_name is explicitly cast to text type to match function return type
    - Maintain existing functionality while resolving the type mismatch error

  2. Security
    - Maintains existing security settings (SECURITY DEFINER)
    - Preserves existing permissions for authenticated and anonymous users
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.get_feed_posts;

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION public.get_feed_posts(
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  photo_url text,
  caption text,
  likes_count integer,
  comments_count integer,
  created_at timestamptz,
  username text,  -- This is the column that needs to match text type
  avatar_url text,
  is_liked boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.photo_url,
    p.caption,
    p.likes_count,
    p.comments_count,
    p.created_at,
    COALESCE(up.display_name, u.email)::text,  -- Explicitly cast to text to match return type
    up.avatar_url,
    EXISTS (
      SELECT 1 FROM post_likes pl 
      WHERE pl.post_id = p.id AND pl.user_id = auth.uid()
    ) as is_liked
  FROM 
    posts p
  LEFT JOIN 
    user_profiles up ON p.user_id = up.user_id
  JOIN 
    auth.users u ON p.user_id = u.id
  ORDER BY 
    p.created_at DESC
  LIMIT 
    p_limit
  OFFSET 
    p_offset;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_feed_posts(integer, integer) TO authenticated;

-- Grant execute permission to anonymous users for public feed
GRANT EXECUTE ON FUNCTION public.get_feed_posts(integer, integer) TO anon;