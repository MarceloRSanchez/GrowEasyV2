/*
  # Full-Text Search for Plants

  1. Extensions
    - Enable pg_trgm for fuzzy matching and similarity scoring
  
  2. Indexes
    - Create GIN index on plants table for fast full-text search
    - Index covers name and scientific_name columns
  
  3. Functions
    - search_plants: Full-text search with similarity ranking
    - Supports pagination with limit/offset
    - Returns plants ordered by relevance
  
  4. Security
    - Grant execute permission to authenticated users
*/

-- Enable pg_trgm extension for fuzzy matching if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;

-- Create GIN index for fast full-text search on plants
CREATE INDEX IF NOT EXISTS idx_plants_fts
  ON public.plants
  USING gin ((to_tsvector('english', coalesce(name,'') || ' ' || coalesce(scientific_name,''))));

-- Create additional index for similarity scoring
CREATE INDEX IF NOT EXISTS idx_plants_similarity
  ON public.plants
  USING gin (name gin_trgm_ops, scientific_name gin_trgm_ops);

-- RPC function for searching plants with full-text search and similarity ranking
CREATE OR REPLACE FUNCTION public.search_plants(
  q text,
  search_limit int DEFAULT 20,
  search_offset int DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  scientific_name text,
  image_url text,
  category text,
  difficulty text,
  care_schedule jsonb,
  growth_time integer,
  sunlight text,
  water_needs text,
  tips text[],
  created_at timestamptz,
  relevance_score real
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    p.id,
    p.name,
    p.scientific_name,
    p.image_url,
    p.category,
    p.difficulty,
    p.care_schedule,
    p.growth_time,
    p.sunlight,
    p.water_needs,
    p.tips,
    p.created_at,
    GREATEST(
      similarity(p.name, q),
      similarity(coalesce(p.scientific_name, ''), q)
    ) as relevance_score
  FROM public.plants p
  WHERE 
    -- Full-text search condition
    to_tsvector('english', p.name || ' ' || coalesce(p.scientific_name, '')) @@ plainto_tsquery('english', q)
    OR
    -- Fuzzy matching fallback for partial matches
    (similarity(p.name, q) > 0.1 OR similarity(coalesce(p.scientific_name, ''), q) > 0.1)
  ORDER BY 
    relevance_score DESC,
    p.name ASC
  LIMIT coalesce(search_limit, 20)
  OFFSET coalesce(search_offset, 0);
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.search_plants TO authenticated;

-- Grant execute permission to anon users for public plant search
GRANT EXECUTE ON FUNCTION public.search_plants TO anon;