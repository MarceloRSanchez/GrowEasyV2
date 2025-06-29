/*
  # Create leaderboard view and RPC function

  1. New Views
    - `public_leaderboard`
      - Combines user profiles and stats data
      - Calculates user rankings based on eco points
      - Includes user ID, display name, avatar, eco points, plants grown, and rank

  2. New Functions
    - `get_leaderboard(p_limit integer)`
      - Returns top users from the leaderboard
      - Accepts a limit parameter to control number of results

  3. Security
    - View is accessible to public (read-only)
    - RPC function is accessible to public
*/

-- Create the public_leaderboard view
CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT
  up.user_id AS id,
  COALESCE(up.display_name, 'Anonymous User') AS name,
  COALESCE(up.avatar_url, 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400') AS avatar,
  COALESCE(us.eco_points, 0) AS eco_points,
  COALESCE(us.plants_grown, 0) AS plants_grown,
  RANK() OVER (ORDER BY COALESCE(us.eco_points, 0) DESC) AS rank
FROM
  public.user_profiles up
LEFT JOIN
  public.user_stats us ON up.user_id = us.user_id
ORDER BY eco_points DESC;

-- Create the get_leaderboard RPC function
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  avatar text,
  eco_points integer,
  plants_grown integer,
  rank bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    lb.id,
    lb.name,
    lb.avatar,
    lb.eco_points,
    lb.plants_grown,
    lb.rank
  FROM public.public_leaderboard lb
  LIMIT p_limit;
$$;

-- Grant access to the view and function
GRANT SELECT ON public.public_leaderboard TO public;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(integer) TO public;