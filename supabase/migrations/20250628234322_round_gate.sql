/*
  # Social Media Feed Implementation

  1. New Tables
    - `posts` - Stores user posts with photo URL, caption, and engagement metrics
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `photo_url` (text, required)
      - `caption` (text, optional)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on posts table
    - Add policies for:
      - Public read access to all posts
      - Users can only create their own posts
      - Users can only update their own posts
      - Users can only delete their own posts

  3. Performance
    - Add descending index on created_at for efficient feed sorting

  4. Functions
    - `get_feed_posts` - Retrieves paginated feed posts sorted by creation date
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url text NOT NULL,
  caption text,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add descending index on created_at for efficient feed sorting
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON posts (created_at DESC);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Public read access
CREATE POLICY "Posts are viewable by everyone"
  ON posts
  FOR SELECT
  USING (true);

-- User-specific create permissions
CREATE POLICY "Users can create their own posts"
  ON posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User-specific update permissions
CREATE POLICY "Users can update their own posts"
  ON posts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- User-specific delete permissions
CREATE POLICY "Users can delete their own posts"
  ON posts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create RPC function for paginated feed
CREATE OR REPLACE FUNCTION get_feed_posts(
  p_limit integer DEFAULT 10,
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
  username text,
  avatar_url text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    u.email as username, -- Using email as username for simplicity
    NULL as avatar_url   -- Placeholder for avatar URL
  FROM 
    posts p
    JOIN auth.users u ON p.user_id = u.id
  ORDER BY 
    p.created_at DESC
  LIMIT 
    p_limit
  OFFSET 
    p_offset;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_feed_posts(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feed_posts(integer, integer) TO anon;

-- Create likes table for tracking user likes
CREATE TABLE IF NOT EXISTS post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on likes table
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for likes
CREATE POLICY "Post likes are viewable by everyone"
  ON post_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like posts"
  ON post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE IF NOT EXISTS post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on comments table
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
CREATE POLICY "Post comments are viewable by everyone"
  ON post_comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON post_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON post_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON post_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to like a post
CREATE OR REPLACE FUNCTION like_post(
  p_post_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_success boolean := false;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Insert like if not already liked
  BEGIN
    INSERT INTO post_likes (post_id, user_id)
    VALUES (p_post_id, v_user_id);
    
    -- Update likes count
    UPDATE posts
    SET likes_count = likes_count + 1
    WHERE id = p_post_id;
    
    v_success := true;
  EXCEPTION
    WHEN unique_violation THEN
      -- Already liked, do nothing
      v_success := false;
  END;
  
  RETURN v_success;
END;
$$;

-- Function to unlike a post
CREATE OR REPLACE FUNCTION unlike_post(
  p_post_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_success boolean := false;
  v_deleted boolean;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Delete like if exists
  WITH deleted AS (
    DELETE FROM post_likes
    WHERE post_id = p_post_id AND user_id = v_user_id
    RETURNING true
  )
  SELECT EXISTS (SELECT 1 FROM deleted) INTO v_deleted;
  
  IF v_deleted THEN
    -- Update likes count
    UPDATE posts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = p_post_id;
    
    v_success := true;
  END IF;
  
  RETURN v_success;
END;
$$;

-- Function to add a comment
CREATE OR REPLACE FUNCTION add_comment(
  p_post_id uuid,
  p_content text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_comment_id uuid;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- Validate content
  IF p_content IS NULL OR LENGTH(TRIM(p_content)) = 0 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;

  -- Insert comment
  INSERT INTO post_comments (post_id, user_id, content)
  VALUES (p_post_id, v_user_id, p_content)
  RETURNING id INTO v_comment_id;
  
  -- Update comments count
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = p_post_id;
  
  RETURN v_comment_id;
END;
$$;

-- Function to get post comments
CREATE OR REPLACE FUNCTION get_post_comments(
  p_post_id uuid,
  p_limit integer DEFAULT 10,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  post_id uuid,
  user_id uuid,
  content text,
  created_at timestamptz,
  username text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.id,
    pc.post_id,
    pc.user_id,
    pc.content,
    pc.created_at,
    u.email as username -- Using email as username for simplicity
  FROM 
    post_comments pc
    JOIN auth.users u ON pc.user_id = u.id
  WHERE 
    pc.post_id = p_post_id
  ORDER BY 
    pc.created_at DESC
  LIMIT 
    p_limit
  OFFSET 
    p_offset;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION like_post(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION unlike_post(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION add_comment(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_comments(uuid, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_post_comments(uuid, integer, integer) TO anon;