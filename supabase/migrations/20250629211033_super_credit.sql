/*
  # Add Leaderboard Function

  1. New Functions
    - `get_leaderboard` - Returns a list of users ranked by eco_points
  
  2. Security
    - Function is accessible to all users (public)
*/

-- Function to get leaderboard data
CREATE OR REPLACE FUNCTION get_leaderboard(
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  avatar TEXT,
  eco_points INTEGER,
  plants_grown INTEGER,
  rank BIGINT
) SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    COALESCE(display_name, 'Anonymous') AS name,
    avatar_url AS avatar,
    eco_points,
    plants_grown,
    rank
  FROM 
    public_leaderboard
  ORDER BY 
    rank
  LIMIT 
    p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant access to public
GRANT EXECUTE ON FUNCTION get_leaderboard(INT) TO public;