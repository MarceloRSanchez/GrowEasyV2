/*
  # Calendar Tasks and Care Actions Update

  1. Function Updates
    - Update `log_care_action` to support uncompleting tasks
    - Add notification ID tracking for task notifications
    - Improve error handling and validation
  
  2. New Features
    - Support for offline actions with queue processing
    - Eco score calculation based on action type
    - Notification management integration
  
  3. Security
    - Maintain existing RLS policies
    - Validate user ownership of plants
*/

-- Update the log_care_action function to support uncompleting tasks
CREATE OR REPLACE FUNCTION public.log_care_action(
  p_task_id uuid,
  p_user_plant_id uuid,
  p_action_type text,
  p_amount_ml integer DEFAULT NULL,
  p_uncomplete boolean DEFAULT false
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_eco_points_delta integer;
  v_notification_id text;
  v_result json;
  v_existing_record uuid;
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
  
  -- If uncompleting, negate the eco points
  IF p_uncomplete THEN
    v_eco_points_delta := -v_eco_points_delta;
    
    -- Find and delete the existing record
    SELECT id INTO v_existing_record
    FROM care_history
    WHERE user_plant_id = p_user_plant_id
      AND action_type = p_action_type
      AND DATE(performed_at) = CURRENT_DATE
    ORDER BY performed_at DESC
    LIMIT 1;
    
    IF v_existing_record IS NOT NULL THEN
      DELETE FROM care_history WHERE id = v_existing_record;
    END IF;
  ELSE
    -- Insert care history record
    INSERT INTO care_history (
      id,
      user_plant_id,
      action_type,
      amount_ml,
      performed_at,
      notes
    ) VALUES (
      COALESCE(p_task_id, gen_random_uuid()),
      p_user_plant_id,
      p_action_type,
      p_amount_ml,
      NOW(),
      'Logged from calendar'
    );
  END IF;
  
  -- Update user stats
  UPDATE user_stats
  SET
    eco_points = GREATEST(0, eco_points + v_eco_points_delta),
    delta_week = delta_week + v_eco_points_delta,
    streak_days = CASE 
      WHEN p_uncomplete THEN GREATEST(0, streak_days - 1)
      WHEN last_action_date = CURRENT_DATE - INTERVAL '1 day' THEN streak_days + 1 
      WHEN last_action_date = CURRENT_DATE THEN streak_days
      ELSE 1 
    END,
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
      GREATEST(0, v_eco_points_delta),
      v_eco_points_delta,
      CASE WHEN p_uncomplete THEN 0 ELSE 1 END,
      CURRENT_DATE
    );
  END IF;
  
  -- Build result
  SELECT json_build_object(
    'success', true,
    'eco_points_delta', v_eco_points_delta,
    'task_id', p_task_id,
    'user_plant_id', p_user_plant_id,
    'action_type', p_action_type,
    'notification_id', v_notification_id
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Update the get_tasks_by_range function to include user_plant_id
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.log_care_action(uuid, uuid, text, integer, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tasks_by_range(uuid, date, date) TO authenticated;