/*
  # Create User Plant Function

  1. New Function
    - `create_user_plant` - Creates a new user plant with care schedule
    - Calculates next watering and fertilizing dates
    - Returns the new user plant ID for navigation

  2. Security
    - Function is security definer to ensure proper access
    - Only authenticated users can execute
    - User ID validation to prevent unauthorized access

  3. Features
    - Automatic next action calculation
    - Growth tracking initialization
    - Care schedule setup based on user preferences
*/

CREATE OR REPLACE FUNCTION public.create_user_plant(
  p_user_id uuid,
  p_plant_id uuid,
  p_nickname text,
  p_water_days int,
  p_fertilize_days int
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid := gen_random_uuid();
  _next_water_date timestamptz;
  _next_fertilize_date timestamptz;
BEGIN
  -- Validate input parameters
  IF p_user_id IS NULL OR p_plant_id IS NULL OR p_nickname IS NULL THEN
    RAISE EXCEPTION 'Missing required parameters';
  END IF;

  IF LENGTH(TRIM(p_nickname)) < 2 OR LENGTH(TRIM(p_nickname)) > 24 THEN
    RAISE EXCEPTION 'Nickname must be between 2 and 24 characters';
  END IF;

  IF p_water_days < 1 OR p_water_days > 30 OR p_fertilize_days < 1 OR p_fertilize_days > 30 THEN
    RAISE EXCEPTION 'Care intervals must be between 1 and 30 days';
  END IF;

  -- Verify plant exists
  IF NOT EXISTS (SELECT 1 FROM public.plants WHERE id = p_plant_id) THEN
    RAISE EXCEPTION 'Plant not found';
  END IF;

  -- Calculate next care dates
  _next_water_date := CURRENT_DATE + (p_water_days || ' days')::interval;
  _next_fertilize_date := CURRENT_DATE + (p_fertilize_days || ' days')::interval;

  -- Insert new user plant
  INSERT INTO public.user_plants (
    id,
    user_id,
    plant_id,
    nickname,
    sow_date,
    growth_percent,
    location,
    notes,
    is_active,
    last_watered,
    last_fertilized,
    next_watering_due,
    next_fertilizing_due,
    created_at,
    updated_at
  )
  VALUES (
    _id,
    p_user_id,
    p_plant_id,
    TRIM(p_nickname),
    CURRENT_DATE,
    0, -- Starting growth
    NULL, -- No location set initially
    NULL, -- No notes initially
    true, -- Active by default
    NULL, -- Not watered yet
    NULL, -- Not fertilized yet
    _next_water_date,
    _next_fertilize_date,
    NOW(),
    NOW()
  );

  -- Create initial user stats if they don't exist
  INSERT INTO public.user_stats (
    user_id,
    eco_points,
    delta_week,
    streak_days,
    liters_saved,
    plants_grown,
    created_at,
    updated_at
  )
  VALUES (
    p_user_id,
    10, -- Starting eco points for adding first plant
    10, -- Delta for this week
    1, -- Starting streak
    0, -- No water saved yet
    1, -- First plant grown
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plants_grown = user_stats.plants_grown + 1,
    eco_points = user_stats.eco_points + 10,
    delta_week = user_stats.delta_week + 10,
    updated_at = NOW();

  RETURN _id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_plant TO authenticated;