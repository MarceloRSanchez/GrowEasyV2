/*
  # Add search_plants_count function

  1. New Functions
    - `search_plants_count` - Returns the total count of plants matching a search query
      - Uses the same search logic as search_plants but returns only the count
      - Helps with pagination and showing total results count in UI

  2. Security
    - Function is accessible to all users (public)
*/

-- Function to count plants matching a search query
CREATE OR REPLACE FUNCTION search_plants_count(q text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count integer;
BEGIN
  -- Count plants matching the search query
  SELECT COUNT(*)
  INTO v_count
  FROM plants p
  WHERE 
    -- Full-text search on name and scientific_name
    to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.scientific_name, '')) @@ plainto_tsquery('english', q)
    -- Similarity search as fallback
    OR p.name % q
    OR p.scientific_name % q;
    
  RETURN v_count;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION search_plants_count(text) TO public;