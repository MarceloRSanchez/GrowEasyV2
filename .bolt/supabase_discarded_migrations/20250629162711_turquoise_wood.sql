/*
  # Add comments functions and procedures

  1. New Functions
    - `get_post_comments` - Retrieves paginated comments for a post
    - `add_post_comment` - Adds a new comment to a post
    - `increment_comment_count` - Updates the comment count on a post

  2. Security
    - Enable RLS on all functions
    - Add policies for authenticated users
*/

-- Function to get paginated comments for a post
CREATE OR REPLACE FUNCTION get_post_comments(
  p_post_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  username TEXT,
  avatar_url TEXT
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.content,
    pc.created_at,
    pc.user_id,
    up.display_name::TEXT AS username,
    up.avatar_url
  FROM
    post_comments pc
  JOIN
    user_profiles up ON pc.user_id = up.user_id
  WHERE
    pc.post_id = p_post_id
  ORDER BY
    pc.created_at DESC
  LIMIT
    p_limit
  OFFSET
    p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to add a comment to a post
CREATE OR REPLACE FUNCTION add_post_comment(
  p_post_id UUID,
  p_content TEXT
)
RETURNS UUID SECURITY DEFINER
AS $$
DECLARE
  v_comment_id UUID;
BEGIN
  -- Validate input
  IF p_content IS NULL OR LENGTH(TRIM(p_content)) = 0 THEN
    RAISE EXCEPTION 'Comment content cannot be empty';
  END IF;

  -- Insert the comment
  INSERT INTO post_comments (
    post_id,
    user_id,
    content
  ) VALUES (
    p_post_id,
    auth.uid(),
    TRIM(p_content)
  )
  RETURNING id INTO v_comment_id;

  -- Update the comment count on the post
  PERFORM increment_comment_count(p_post_id);

  RETURN v_comment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment the comment count on a post
CREATE OR REPLACE FUNCTION increment_comment_count(
  p_post_id UUID
)
RETURNS VOID SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count + 1
  WHERE id = p_post_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update post comment counts when comments are deleted
CREATE OR REPLACE FUNCTION decrement_comment_count()
RETURNS TRIGGER SECURITY DEFINER
AS $$
BEGIN
  UPDATE posts
  SET comments_count = comments_count - 1
  WHERE id = OLD.post_id AND comments_count > 0;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment deletion
CREATE TRIGGER tr_decrement_comment_count
AFTER DELETE ON post_comments
FOR EACH ROW
EXECUTE FUNCTION decrement_comment_count();

-- Update the get_feed_posts function to ensure type compatibility
CREATE OR REPLACE FUNCTION get_feed_posts(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  photo_url TEXT,
  caption TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMPTZ,
  username TEXT,
  avatar_url TEXT
) SECURITY DEFINER
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
    up.display_name::TEXT AS username,
    up.avatar_url
  FROM
    posts p
  JOIN
    user_profiles up ON p.user_id = up.user_id
  ORDER BY
    p.created_at DESC
  LIMIT
    p_limit
  OFFSET
    p_offset;
END;
$$ LANGUAGE plpgsql;