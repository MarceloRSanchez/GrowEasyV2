-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Plants catalog table
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('herb', 'vegetable', 'fruit', 'flower', 'succulent')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  care_schedule JSONB NOT NULL DEFAULT '{}',
  growth_time INTEGER NOT NULL DEFAULT 60,
  sunlight TEXT NOT NULL CHECK (sunlight IN ('low', 'medium', 'high')),
  water_needs TEXT NOT NULL CHECK (water_needs IN ('low', 'medium', 'high')),
  tips TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User plants table
CREATE TABLE IF NOT EXISTS user_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  sow_date DATE NOT NULL,
  growth_percent INTEGER DEFAULT 0 CHECK (growth_percent >= 0 AND growth_percent <= 100),
  location TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_watered TIMESTAMPTZ,
  last_fertilized TIMESTAMPTZ,
  next_watering_due TIMESTAMPTZ,
  next_fertilizing_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats table for eco score tracking
CREATE TABLE IF NOT EXISTS user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  eco_points INTEGER DEFAULT 0,
  delta_week INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  liters_saved NUMERIC(10,2) DEFAULT 0,
  plants_grown INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plants (public read access)
CREATE POLICY "Plants are viewable by everyone" ON plants
  FOR SELECT USING (true);

-- RLS Policies for user_plants
CREATE POLICY "Users can view own plants" ON user_plants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plants" ON user_plants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plants" ON user_plants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plants" ON user_plants
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_stats
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to get home snapshot data
CREATE OR REPLACE FUNCTION public.get_home_snapshot(p_uid UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  plant_data JSON;
  care_data JSON;
  stats_data RECORD;
BEGIN
  -- Get user stats
  SELECT 
    COALESCE(eco_points, 0) as eco_score,
    COALESCE(delta_week, 0) as delta_week,
    COALESCE(streak_days, 0) as streak_days,
    COALESCE(liters_saved, 0) as liters_saved
  INTO stats_data
  FROM user_stats 
  WHERE user_id = p_uid
  LIMIT 1;

  -- If no stats exist, create default
  IF NOT FOUND THEN
    INSERT INTO user_stats (user_id, eco_points, delta_week, streak_days, liters_saved)
    VALUES (p_uid, 0, 0, 0, 0);
    
    stats_data.eco_score := 0;
    stats_data.delta_week := 0;
    stats_data.streak_days := 0;
    stats_data.liters_saved := 0;
  END IF;

  -- Get plants data
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', up.id,
      'name', up.nickname,
      'photoUrl', p.image_url,
      'species', p.scientific_name,
      'progressPct', up.growth_percent,
      'nextActionLabel', 
        CASE 
          WHEN up.next_watering_due <= NOW() THEN 'Water now'
          WHEN up.next_watering_due <= NOW() + INTERVAL '2 hours' THEN 'Water in 2 hours'
          WHEN up.next_fertilizing_due <= NOW() + INTERVAL '1 day' THEN 'Fertilize tomorrow'
          WHEN up.growth_percent >= 90 THEN 'Harvest ready'
          ELSE 'Growing well'
        END,
      'nextActionColor',
        CASE 
          WHEN up.next_watering_due <= NOW() THEN '#EF4444'
          WHEN up.next_watering_due <= NOW() + INTERVAL '2 hours' THEN '#3DB5FF'
          WHEN up.next_fertilizing_due <= NOW() + INTERVAL '1 day' THEN '#F59E0B'
          WHEN up.growth_percent >= 90 THEN '#10B981'
          ELSE '#32E177'
        END
    )
  ), '[]'::json) INTO plant_data
  FROM user_plants up
  JOIN plants p ON p.id = up.plant_id
  WHERE up.user_id = p_uid AND up.is_active = true
  ORDER BY up.created_at DESC
  LIMIT 10;

  -- Get today's care tasks
  WITH care_tasks AS (
    SELECT 
      up.nickname,
      CASE 
        WHEN up.next_watering_due <= NOW() THEN 'watering'
        WHEN up.next_fertilizing_due <= NOW() THEN 'fertilizing'
        ELSE NULL
      END as task_type
    FROM user_plants up
    WHERE up.user_id = p_uid 
      AND up.is_active = true
      AND (up.next_watering_due <= NOW() OR up.next_fertilizing_due <= NOW())
  ),
  task_summary AS (
    SELECT 
      COUNT(*) as task_count,
      array_agg(nickname) as plant_names
    FROM care_tasks
    WHERE task_type IS NOT NULL
  )
  SELECT 
    CASE 
      WHEN task_count > 0 THEN
        json_build_object(
          'taskLabel', 
          CASE 
            WHEN task_count = 1 THEN 'Water 1 plant'
            ELSE 'Water ' || task_count || ' plants'
          END,
          'plants', plant_names
        )
      ELSE NULL
    END INTO care_data
  FROM task_summary;

  -- Build final result
  result := json_build_object(
    'ecoScore', COALESCE(stats_data.eco_score, 0),
    'deltaWeek', COALESCE(stats_data.delta_week, 0),
    'streakDays', COALESCE(stats_data.streak_days, 0),
    'litersSaved', COALESCE(stats_data.liters_saved, 0),
    'plants', plant_data,
    'todayCare', care_data
  );

  RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_home_snapshot(UUID) TO authenticated;

-- Insert sample plants data
INSERT INTO plants (name, scientific_name, image_url, category, difficulty, care_schedule, growth_time, sunlight, water_needs, tips) VALUES
('Basil', 'Ocimum basilicum', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800', 'herb', 'beginner', '{"watering": 2, "fertilizing": 14}', 75, 'high', 'medium', ARRAY['Pinch flowers to encourage leaf growth', 'Harvest in the morning for best flavor', 'Likes warm, humid conditions']),
('Cherry Tomato', 'Solanum lycopersicum', 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800', 'vegetable', 'intermediate', '{"watering": 1, "fertilizing": 10, "pruning": 7}', 85, 'high', 'high', ARRAY['Support with stakes or cages', 'Remove suckers for better fruit production', 'Water consistently to prevent blossom end rot']),
('Mint', 'Mentha', 'https://images.pexels.com/photos/568470/pexels-photo-568470.jpeg?auto=compress&cs=tinysrgb&w=800', 'herb', 'beginner', '{"watering": 2, "fertilizing": 21}', 60, 'medium', 'high', ARRAY['Contains easily, grow in separate pot', 'Pinch flowers to maintain leaf quality', 'Thrives in partial shade']),
('Lettuce', 'Lactuca sativa', 'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&cs=tinysrgb&w=800', 'vegetable', 'beginner', '{"watering": 1, "fertilizing": 14}', 45, 'medium', 'medium', ARRAY['Harvest outer leaves first', 'Grows well in cooler weather', 'Keep soil consistently moist']),
('Strawberry', 'Fragaria × ananassa', 'https://images.pexels.com/photos/70746/strawberries-red-fruit-royalty-free-70746.jpeg?auto=compress&cs=tinysrgb&w=800', 'fruit', 'intermediate', '{"watering": 2, "fertilizing": 14}', 120, 'high', 'medium', ARRAY['Remove runners for larger berries', 'Protect from birds when fruiting', 'Replace plants every 3-4 years'])
ON CONFLICT DO NOTHING;