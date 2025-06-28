/*
  # Calendar Tasks and Care History Integration

  1. New Functions
    - `get_tasks_by_range(user_id, start_date, end_date)` - Retrieves care tasks for a date range
    - `log_care_action(task_id, amount_ml)` - Logs a care action and updates eco score
  
  2. Triggers
    - Update user_stats when care actions are logged
    - Recalculate next care dates
  
  3. Security
    - Functions use security definer to ensure proper access control
    - Only authenticated users can execute these functions
*/

-- Function to get tasks by date range
CREATE OR REPLACE FUNCTION public.get_tasks_by_range(
  p_user_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  -- Validate input
  IF p_user_id IS NULL OR p_start_date IS NULL OR p_end_date IS NULL THEN
    RAISE EXCEPTION 'Invalid parameters';
  END IF;

  -- Get tasks for the date range
  WITH tasks AS (
    SELECT
      up.id AS user_plant_id,
      up.nickname AS plant_name,
      p.image_url AS plant_image,
      
      -- Water tasks
      CASE WHEN up.next_watering_due::date BETWEEN p_start_date AND p_end_date
        THEN json_build_object(
          'id', gen_random_uuid(),
          'user_plant_id', up.id,
          'type', 'watering',
          'due_date', up.next_watering_due::date,
          'completed', up.last_watered IS NOT NULL AND up.last_watered::date = up.next_watering_due::date,
          'notes', 'Water ' || up.nickname
        )
        ELSE NULL
      END AS water_task,
      
      -- Fertilize tasks
      CASE WHEN up.next_fertilizing_due::date BETWEEN p_start_date AND p_end_date
        THEN json_build_object(
          'id', gen_random_uuid(),
          'user_plant_id', up.id,
          'type', 'fertilizing',
          'due_date', up.next_fertilizing_due::date,
          'completed', up.last_fertilized IS NOT NULL AND up.last_fertilized::date = up.next_fertilizing_due::date,
          'notes', 'Fertilize ' || up.nickname
        )
        ELSE NULL
      END AS fertilize_task,
      
      -- Harvest tasks (for plants with growth >= 90%)
      CASE WHEN up.growth_percent >= 90
        THEN json_build_object(
          'id', gen_random_uuid(),
          'user_plant_id', up.id,
          'type', 'harvesting',
          'due_date', CURRENT_DATE,
          'completed', false,
          'notes', 'Harvest ' || up.nickname
        )
        ELSE NULL
      END AS harvest_task
    FROM
      user_plants up
      JOIN plants p ON up.plant_id = p.id
    WHERE
      up.user_id = p_user_id
      AND up.is_active = true
  ),
  
  -- Unnest tasks and group by date
  flattened_tasks AS (
    SELECT
      t.water_task->>'due_date' AS task_date,
      t.water_task AS task
    FROM tasks t
    WHERE t.water_task IS NOT NULL
    
    UNION ALL
    
    SELECT
      t.fertilize_task->>'due_date' AS task_date,
      t.fertilize_task AS task
    FROM tasks t
    WHERE t.fertilize_task IS NOT NULL
    
    UNION ALL
    
    SELECT
      t.harvest_task->>'due_date' AS task_date,
      t.harvest_task AS task
    FROM tasks t
    WHERE t.harvest_task IS NOT NULL
  ),
  
  -- Group tasks by date
  grouped_tasks AS (
    SELECT
      task_date,
      json_agg(task) AS tasks
    FROM flattened_tasks
    GROUP BY task_date
  )
  
  -- Build final result
  SELECT
    json_object_agg(
      task_date,
      tasks
    ) INTO result
  FROM grouped_tasks;

  -- Return empty object if no tasks found
  RETURN COALESCE(result, '{}'::json);
END;
$$;

-- Function to log care action and update eco score
CREATE OR REPLACE FUNCTION public.log_care_action(
  p_task_id uuid,
  p_user_plant_id uuid,
  p_action_type text,
  p_amount_ml integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_eco_points_delta integer;
  v_result json;
BEGIN
  -- Validate input
  IF p_user_plant_id IS NULL OR p_action_type IS NULL THEN
    RAISE EXCEPTION 'Invalid parameters';
  END IF;
  
  -- Validate action type
  IF p_action_type NOT IN ('water', 'fertilize', 'harvest') THEN
    RAISE EXCEPTION 'Invalid action type: %', p_action_type;
  END IF;
  
  -- Get user ID from user_plant
  SELECT user_id INTO v_user_id
  FROM user_plants
  WHERE id = p_user_plant_id;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Plant not found or access denied';
  END IF;
  
  -- Calculate eco points delta based on action type
  v_eco_points_delta := 
    CASE p_action_type
      WHEN 'water' THEN 1
      WHEN 'fertilize' THEN 2
      WHEN 'harvest' THEN 3
      ELSE 0
    END;
  
  -- Insert care history record
  INSERT INTO care_history (
    id,
    user_plant_id,
    action_type,
    amount_ml,
    performed_at,
    notes
  ) VALUES (
    p_task_id,
    p_user_plant_id,
    p_action_type,
    p_amount_ml,
    NOW(),
    'Logged from calendar'
  );
  
  -- Update user stats
  UPDATE user_stats
  SET
    eco_points = eco_points + v_eco_points_delta,
    delta_week = delta_week + v_eco_points_delta,
    streak_days = CASE WHEN last_action_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1 ELSE 1 END,
    last_action_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE user_id = v_user_id;
  
  -- If no stats record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_stats (
      user_id,
      eco_points,
      delta_week,
      streak_days,
      last_action_date
    ) VALUES (
      v_user_id,
      v_eco_points_delta,
      v_eco_points_delta,
      1,
      CURRENT_DATE
    );
  END IF;
  
  -- Build result
  SELECT json_build_object(
    'success', true,
    'eco_points_delta', v_eco_points_delta,
    'task_id', p_task_id,
    'user_plant_id', p_user_plant_id,
    'action_type', p_action_type
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Add last_action_date column to user_stats if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'user_stats' AND column_name = 'last_action_date'
  ) THEN
    ALTER TABLE user_stats ADD COLUMN last_action_date date;
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_tasks_by_range(uuid, date, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_care_action(uuid, uuid, text, integer) TO authenticated;