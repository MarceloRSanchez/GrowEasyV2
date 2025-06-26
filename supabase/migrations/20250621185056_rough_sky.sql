/*
  # Fix get_plant_detail function

  This migration fixes the get_plant_detail function to avoid nested aggregate function calls.
  The function now uses CTEs (Common Table Expressions) to properly structure the data aggregation.

  1. Function Updates
    - Restructured get_plant_detail function to avoid nested aggregates
    - Uses CTEs for better query organization
    - Properly handles analytics data aggregation
    - Ensures all data is returned in the expected format

  2. Security
    - Maintains existing RLS policies
    - Function respects user ownership of plants
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_plant_detail(uuid, uuid);

-- Create the corrected get_plant_detail function
CREATE OR REPLACE FUNCTION get_plant_detail(
  p_user_plant_id uuid,
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Check if the user owns this plant
  IF NOT EXISTS (
    SELECT 1 FROM user_plants 
    WHERE id = p_user_plant_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Plant not found or access denied';
  END IF;

  -- Build the result using CTEs to avoid nested aggregates
  WITH plant_data AS (
    SELECT 
      up.id,
      up.nickname,
      up.growth_percent,
      up.sow_date,
      up.location,
      up.notes,
      up.is_active,
      up.last_watered,
      up.last_fertilized,
      up.next_watering_due,
      up.next_fertilizing_due,
      p.id as plant_id,
      p.name as plant_name,
      p.scientific_name,
      p.image_url,
      p.category,
      p.difficulty,
      p.care_schedule,
      p.growth_time,
      p.sunlight,
      p.water_needs,
      p.tips
    FROM user_plants up
    JOIN plants p ON up.plant_id = p.id
    WHERE up.id = p_user_plant_id AND up.user_id = p_user_id
  ),
  
  -- Water history aggregation
  water_history AS (
    SELECT 
      json_agg(
        json_build_object(
          'date', DATE(ch.performed_at),
          'ml', COALESCE(ch.amount_ml, 0)
        ) ORDER BY ch.performed_at DESC
      ) as data
    FROM care_history ch
    WHERE ch.user_plant_id = p_user_plant_id 
      AND ch.action_type = 'water'
      AND ch.performed_at >= NOW() - INTERVAL '30 days'
  ),
  
  -- Sun exposure mock data (since we don't have actual sensor data)
  sun_exposure AS (
    SELECT json_agg(
      json_build_object(
        'date', generate_series::date,
        'hours', (RANDOM() * 8 + 2)::numeric(5,2)
      )
    ) as data
    FROM generate_series(
      NOW() - INTERVAL '7 days',
      NOW(),
      INTERVAL '1 day'
    )
  ),
  
  -- Latest soil humidity from sensor logs
  soil_humidity AS (
    SELECT humidity
    FROM sensor_logs
    WHERE user_plant_id = p_user_plant_id
    ORDER BY recorded_at DESC
    LIMIT 1
  ),
  
  -- Plant notes aggregation
  notes_data AS (
    SELECT 
      json_agg(
        json_build_object(
          'id', pn.id,
          'imageUrl', pn.image_url,
          'caption', pn.caption,
          'createdAt', pn.created_at
        ) ORDER BY pn.created_at DESC
      ) as data
    FROM plant_notes pn
    WHERE pn.user_plant_id = p_user_plant_id
  ),
  
  -- Next actions calculation
  next_actions AS (
    SELECT json_agg(
      json_build_object(
        'type', action_type,
        'label', CASE 
          WHEN action_type = 'water' THEN 'Water plant'
          WHEN action_type = 'fertilize' THEN 'Fertilize plant'
          WHEN action_type = 'prune' THEN 'Prune plant'
          ELSE 'Care for plant'
        END,
        'due_date', due_date,
        'status', CASE
          WHEN due_date < NOW() THEN 'overdue'
          WHEN due_date < NOW() + INTERVAL '2 days' THEN 'upcoming'
          ELSE 'scheduled'
        END
      )
    ) as data
    FROM (
      SELECT 
        'water' as action_type,
        COALESCE(pd.next_watering_due, NOW() + INTERVAL '3 days') as due_date
      FROM plant_data pd
      WHERE pd.next_watering_due IS NOT NULL
      
      UNION ALL
      
      SELECT 
        'fertilize' as action_type,
        COALESCE(pd.next_fertilizing_due, NOW() + INTERVAL '7 days') as due_date
      FROM plant_data pd
      WHERE pd.next_fertilizing_due IS NOT NULL
    ) actions
  )
  
  -- Build final result
  SELECT json_build_object(
    'plant', json_build_object(
      'id', pd.id,
      'nickname', pd.nickname,
      'growth_percent', pd.growth_percent,
      'sow_date', pd.sow_date,
      'location', pd.location,
      'notes', pd.notes,
      'is_active', pd.is_active,
      'last_watered', pd.last_watered,
      'last_fertilized', pd.last_fertilized,
      'next_watering_due', pd.next_watering_due,
      'next_fertilizing_due', pd.next_fertilizing_due,
      'next_actions', COALESCE(na.data, '[]'::json),
      'plant', json_build_object(
        'id', pd.plant_id,
        'name', pd.plant_name,
        'scientific_name', pd.scientific_name,
        'image_url', pd.image_url,
        'category', pd.category,
        'difficulty', pd.difficulty,
        'care_schedule', pd.care_schedule,
        'growth_time', pd.growth_time,
        'sunlight', pd.sunlight,
        'water_needs', pd.water_needs,
        'tips', pd.tips
      )
    ),
    'analytics', json_build_object(
      'waterHistory', COALESCE(wh.data, '[]'::json),
      'sunExposure', COALESCE(se.data, '[]'::json),
      'soilHumidity', sh.humidity
    ),
    'notes', COALESCE(nd.data, '[]'::json)
  ) INTO result
  FROM plant_data pd
  LEFT JOIN water_history wh ON true
  LEFT JOIN sun_exposure se ON true
  LEFT JOIN soil_humidity sh ON true
  LEFT JOIN notes_data nd ON true
  LEFT JOIN next_actions na ON true;
  
  RETURN result;
END;
$$;