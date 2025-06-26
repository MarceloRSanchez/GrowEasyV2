/*
  # Plant Detail RPC Function

  1. New Function
    - `get_plant_detail(p_user_plant_id uuid, p_user_id uuid)`
    - Returns comprehensive plant data for detail screen
    - Includes plant info, analytics, and notes

  2. Security
    - Uses security definer for RLS handling
    - Validates user ownership of plant

  3. Data Sources
    - user_plants + plants (core data)
    - care_history (water/fertilize analytics)
    - plant_notes (photos and notes)
    - sensor_logs (soil humidity if available)
*/

-- Create care_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS care_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id uuid NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('water', 'fertilize', 'prune', 'harvest')),
  amount_ml integer,
  performed_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create plant_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS plant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id uuid NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  image_url text,
  caption text,
  created_at timestamptz DEFAULT now()
);

-- Create sensor_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS sensor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id uuid NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  humidity numeric(5,2),
  temperature numeric(5,2),
  light_level numeric(5,2),
  recorded_at timestamptz DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE care_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage own care history"
  ON care_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_plants up 
      WHERE up.id = care_history.user_plant_id 
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own plant notes"
  ON plant_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_plants up 
      WHERE up.id = plant_notes.user_plant_id 
      AND up.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own sensor logs"
  ON sensor_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_plants up 
      WHERE up.id = sensor_logs.user_plant_id 
      AND up.user_id = auth.uid()
    )
  );

-- Create the main RPC function
CREATE OR REPLACE FUNCTION public.get_plant_detail(
  p_user_plant_id uuid,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _plant json;
  _analytics json;
  _notes json;
  _next_actions json;
BEGIN
  -- Core plant & user data with next actions
  SELECT json_build_object(
    'id', up.id,
    'nickname', up.nickname,
    'growth_percent', up.growth_percent,
    'sow_date', up.sow_date,
    'location', up.location,
    'notes', up.notes,
    'is_active', up.is_active,
    'last_watered', up.last_watered,
    'last_fertilized', up.last_fertilized,
    'next_watering_due', up.next_watering_due,
    'next_fertilizing_due', up.next_fertilizing_due,
    'plant', json_build_object(
      'id', p.id,
      'name', p.name,
      'scientific_name', p.scientific_name,
      'image_url', p.image_url,
      'category', p.category,
      'difficulty', p.difficulty,
      'care_schedule', p.care_schedule,
      'growth_time', p.growth_time,
      'sunlight', p.sunlight,
      'water_needs', p.water_needs,
      'tips', p.tips
    )
  )
  INTO _plant
  FROM user_plants up
  JOIN plants p ON p.id = up.plant_id
  WHERE up.id = p_user_plant_id
    AND up.user_id = p_user_id;

  -- If no plant found, return null
  IF _plant IS NULL THEN
    RETURN NULL;
  END IF;

  -- Generate next actions based on due dates and growth
  SELECT json_agg(
    json_build_object(
      'type', action_type,
      'label', action_label,
      'due_date', due_date,
      'status', 
        CASE 
          WHEN due_date <= NOW() THEN 'overdue'
          WHEN due_date <= NOW() + INTERVAL '1 day' THEN 'upcoming'
          ELSE 'scheduled'
        END
    )
  )
  INTO _next_actions
  FROM (
    SELECT 
      'water' as action_type,
      CASE 
        WHEN up.next_watering_due <= NOW() THEN 'Water now'
        WHEN up.next_watering_due <= NOW() + INTERVAL '2 hours' THEN 'Water in 2 hours'
        ELSE 'Water scheduled'
      END as action_label,
      up.next_watering_due as due_date
    FROM user_plants up
    WHERE up.id = p_user_plant_id
      AND up.next_watering_due IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'fertilize' as action_type,
      CASE 
        WHEN up.next_fertilizing_due <= NOW() THEN 'Fertilize now'
        WHEN up.next_fertilizing_due <= NOW() + INTERVAL '1 day' THEN 'Fertilize tomorrow'
        ELSE 'Fertilize scheduled'
      END as action_label,
      up.next_fertilizing_due as due_date
    FROM user_plants up
    WHERE up.id = p_user_plant_id
      AND up.next_fertilizing_due IS NOT NULL
    
    UNION ALL
    
    SELECT 
      'harvest' as action_type,
      'Ready to harvest' as action_label,
      NOW() + INTERVAL '1 day' as due_date
    FROM user_plants up
    WHERE up.id = p_user_plant_id
      AND up.growth_percent >= 90
    
    ORDER BY due_date
    LIMIT 5
  ) actions;

  -- Chart data and analytics
  SELECT json_build_object(
    'waterHistory', COALESCE((
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', ch.performed_at)::date,
          'ml', COALESCE(sum(ch.amount_ml), 0)
        )
      )
      FROM care_history ch
      WHERE ch.user_plant_id = p_user_plant_id
        AND ch.action_type = 'water'
        AND ch.performed_at >= NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', ch.performed_at)
      ORDER BY date_trunc('day', ch.performed_at)
    ), '[]'::json),
    
    'sunExposure', COALESCE((
      SELECT json_agg(
        json_build_object(
          'date', date_trunc('day', sl.recorded_at)::date,
          'hours', COALESCE(avg(sl.light_level), 0)
        )
      )
      FROM sensor_logs sl
      WHERE sl.user_plant_id = p_user_plant_id
        AND sl.recorded_at >= NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', sl.recorded_at)
      ORDER BY date_trunc('day', sl.recorded_at)
    ), '[]'::json),
    
    'soilHumidity', (
      SELECT sl.humidity
      FROM sensor_logs sl
      WHERE sl.user_plant_id = p_user_plant_id
      ORDER BY sl.recorded_at DESC
      LIMIT 1
    )
  )
  INTO _analytics;

  -- Notes gallery
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', pn.id,
      'imageUrl', pn.image_url,
      'caption', pn.caption,
      'createdAt', pn.created_at::date
    )
    ORDER BY pn.created_at DESC
  ), '[]'::json)
  INTO _notes
  FROM plant_notes pn
  WHERE pn.user_plant_id = p_user_plant_id;

  -- Combine plant data with next actions
  _plant := _plant || json_build_object('next_actions', COALESCE(_next_actions, '[]'::json));

  RETURN json_build_object(
    'plant', _plant,
    'analytics', _analytics,
    'notes', _notes
  );
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.get_plant_detail(uuid, uuid) TO authenticated;