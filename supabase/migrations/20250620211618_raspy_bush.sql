/*
  # Create sample data helper function

  1. Helper Functions
    - `create_sample_user_data(p_user_id)` - Creates sample plants and stats for new users
  
  2. Security
    - Function has SECURITY DEFINER to bypass RLS during setup
    - Granted execute permission to authenticated users
  
  3. Notes
    - No demo data inserted directly (avoids foreign key issues)
    - Sample data will be created when users actually sign up
    - Function can be called from application code after user registration
*/

-- Function to create sample data for new users
CREATE OR REPLACE FUNCTION public.create_sample_user_data(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  basil_plant_id UUID;
  tomato_plant_id UUID;
  mint_plant_id UUID;
BEGIN
  -- Get plant IDs (ensure plants exist first)
  SELECT id INTO basil_plant_id FROM plants WHERE name = 'Basil' LIMIT 1;
  SELECT id INTO tomato_plant_id FROM plants WHERE name = 'Cherry Tomato' LIMIT 1;
  SELECT id INTO mint_plant_id FROM plants WHERE name = 'Mint' LIMIT 1;

  -- Only proceed if we have the required plants
  IF basil_plant_id IS NOT NULL AND tomato_plant_id IS NOT NULL THEN
    -- Insert sample plants for new user
    INSERT INTO user_plants (
      user_id, plant_id, nickname, sow_date, growth_percent, 
      location, is_active, last_watered, next_watering_due
    ) VALUES
    (
      p_user_id,
      basil_plant_id,
      'My Sweet Basil',
      CURRENT_DATE - INTERVAL '30 days',
      75,
      'Kitchen windowsill',
      true,
      NOW() - INTERVAL '1 day',
      NOW() + INTERVAL '1 day'
    ),
    (
      p_user_id,
      tomato_plant_id,
      'Cherry Tom',
      CURRENT_DATE - INTERVAL '45 days',
      65,
      'Balcony',
      true,
      NOW() - INTERVAL '2 days',
      NOW() + INTERVAL '4 hours'
    );

    -- Add mint if available
    IF mint_plant_id IS NOT NULL THEN
      INSERT INTO user_plants (
        user_id, plant_id, nickname, sow_date, growth_percent, 
        location, is_active, last_watered, next_watering_due
      ) VALUES (
        p_user_id,
        mint_plant_id,
        'Mojito Mint',
        CURRENT_DATE - INTERVAL '20 days',
        85,
        'Kitchen counter',
        true,
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '6 hours'
      );
    END IF;

    -- Insert initial user stats
    INSERT INTO user_stats (
      user_id, eco_points, delta_week, streak_days, liters_saved, plants_grown
    ) VALUES (
      p_user_id,
      1250,
      45,
      12,
      28.5,
      CASE WHEN mint_plant_id IS NOT NULL THEN 3 ELSE 2 END
    );
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_sample_user_data(UUID) TO authenticated;

-- Create a trigger function to automatically create sample data for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create sample data for the new user
  PERFORM public.create_sample_user_data(NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users table to auto-create sample data
-- Note: This trigger will only work if we have access to auth.users
-- In practice, you might want to call create_sample_user_data from your application code
DO $$
BEGIN
  -- Try to create the trigger, but don't fail if auth.users is not accessible
  BEGIN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  EXCEPTION
    WHEN insufficient_privilege OR undefined_table THEN
      -- Trigger creation failed, which is expected in some Supabase setups
      -- The function can still be called manually from application code
      NULL;
  END;
END $$;