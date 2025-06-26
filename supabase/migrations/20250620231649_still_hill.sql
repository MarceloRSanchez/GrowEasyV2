/*
  # Fix get_home_snapshot GROUP BY error

  1. Database Changes
    - Fix the get_home_snapshot function to properly handle GROUP BY clause
    - Remove up.created_at from ORDER BY since it's not in the aggregation
    - Use a subquery to properly order the results before aggregation

  2. Security
    - Maintains existing RLS policies
    - Function remains SECURITY DEFINER for authenticated users
*/

-- Fix the get_home_snapshot function to resolve GROUP BY error
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

  -- Get plants data with proper ordering
  WITH ordered_plants AS (
    SELECT 
      up.id,
      up.nickname,
      p.image_url,
      p.scientific_name,
      up.growth_percent,
      up.next_watering_due,
      up.next_fertilizing_due,
      up.created_at
    FROM user_plants up
    JOIN plants p ON p.id = up.plant_id
    WHERE up.user_id = p_uid AND up.is_active = true
    ORDER BY up.created_at DESC
    LIMIT 10
  )
  SELECT COALESCE(json_agg(
    json_build_object(
      'id', op.id,
      'name', op.nickname,
      'photoUrl', op.image_url,
      'species', op.scientific_name,
      'progressPct', op.growth_percent,
      'nextActionLabel', 
        CASE 
          WHEN op.next_watering_due <= NOW() THEN 'Water now'
          WHEN op.next_watering_due <= NOW() + INTERVAL '2 hours' THEN 'Water in 2 hours'
          WHEN op.next_fertilizing_due <= NOW() + INTERVAL '1 day' THEN 'Fertilize tomorrow'
          WHEN op.growth_percent >= 90 THEN 'Harvest ready'
          ELSE 'Growing well'
        END,
      'nextActionColor',
        CASE 
          WHEN op.next_watering_due <= NOW() THEN '#EF4444'
          WHEN op.next_watering_due <= NOW() + INTERVAL '2 hours' THEN '#3DB5FF'
          WHEN op.next_fertilizing_due <= NOW() + INTERVAL '1 day' THEN '#F59E0B'
          WHEN op.growth_percent >= 90 THEN '#10B981'
          ELSE '#32E177'
        END
    )
  ), '[]'::json) INTO plant_data
  FROM ordered_plants op;

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