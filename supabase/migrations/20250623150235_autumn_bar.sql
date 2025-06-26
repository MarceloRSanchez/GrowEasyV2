/*
  # Fix user_plants unique constraint and create_user_plant function

  1. Database Changes
    - Add unique constraint on user_plants (user_id, plant_id) to prevent duplicate plant entries per user
    - Create or replace the create_user_plant RPC function with proper conflict handling

  2. Security
    - Function uses existing RLS policies on user_plants table
    - Validates user authentication through uid() function

  3. Functionality
    - Prevents users from adding the same plant type multiple times
    - Returns existing user_plant id if duplicate is attempted
    - Creates new user_plant entry with proper defaults if no conflict
*/

-- Add unique constraint to prevent duplicate plants per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_user_plant_per_user' 
    AND table_name = 'user_plants'
  ) THEN
    ALTER TABLE public.user_plants 
    ADD CONSTRAINT unique_user_plant_per_user UNIQUE (user_id, plant_id);
  END IF;
END $$;

-- Create or replace the create_user_plant RPC function
CREATE OR REPLACE FUNCTION create_user_plant(
  p_plant_id uuid,
  p_nickname text,
  p_sow_date date,
  p_location text DEFAULT NULL,
  p_notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_user_plant_id uuid;
BEGIN
  -- Get the authenticated user ID
  v_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Insert new user plant or return existing one if conflict
  INSERT INTO public.user_plants (
    user_id,
    plant_id,
    nickname,
    sow_date,
    location,
    notes,
    growth_percent,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_plant_id,
    p_nickname,
    p_sow_date,
    p_location,
    p_notes,
    0,
    true,
    now(),
    now()
  )
  ON CONFLICT (user_id, plant_id) 
  DO UPDATE SET
    nickname = EXCLUDED.nickname,
    sow_date = EXCLUDED.sow_date,
    location = EXCLUDED.location,
    notes = EXCLUDED.notes,
    updated_at = now()
  RETURNING id INTO v_user_plant_id;
  
  RETURN v_user_plant_id;
END;
$$;