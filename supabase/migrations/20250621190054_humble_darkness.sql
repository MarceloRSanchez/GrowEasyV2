/*
  # Care History and Mutations Setup

  1. Tables
    - `care_history` - Stores all plant care actions (water, fertilize, harvest)
    
  2. Security
    - Enable RLS on care_history table
    - Add policy for users to manage their own care history
    
  3. Functions
    - Update user_plants table with triggers for automatic next action scheduling
*/

-- Ensure care_history table exists with proper structure
CREATE TABLE IF NOT EXISTS care_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_plant_id uuid NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('water', 'fertilize', 'prune', 'harvest')),
  amount_ml integer,
  performed_at timestamptz DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE care_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for care history
DROP POLICY IF EXISTS "Users can manage own care history" ON care_history;
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

-- Function to update plant care dates after logging care
CREATE OR REPLACE FUNCTION update_plant_care_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last watered and next watering due
  IF NEW.action_type = 'water' THEN
    UPDATE user_plants 
    SET 
      last_watered = NEW.performed_at,
      next_watering_due = NEW.performed_at + INTERVAL '2 days',
      updated_at = now()
    WHERE id = NEW.user_plant_id;
  END IF;
  
  -- Update last fertilized and next fertilizing due
  IF NEW.action_type = 'fertilize' THEN
    UPDATE user_plants 
    SET 
      last_fertilized = NEW.performed_at,
      next_fertilizing_due = NEW.performed_at + INTERVAL '14 days',
      updated_at = now()
    WHERE id = NEW.user_plant_id;
  END IF;
  
  -- Update growth percentage slightly for any care action
  UPDATE user_plants 
  SET 
    growth_percent = LEAST(100, growth_percent + 
      CASE 
        WHEN NEW.action_type = 'water' THEN 2
        WHEN NEW.action_type = 'fertilize' THEN 5
        WHEN NEW.action_type = 'prune' THEN 3
        WHEN NEW.action_type = 'harvest' THEN 0
        ELSE 1
      END
    ),
    updated_at = now()
  WHERE id = NEW.user_plant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic care date updates
DROP TRIGGER IF EXISTS trigger_update_plant_care_dates ON care_history;
CREATE TRIGGER trigger_update_plant_care_dates
  AFTER INSERT ON care_history
  FOR EACH ROW
  EXECUTE FUNCTION update_plant_care_dates();

-- Grant necessary permissions
GRANT ALL ON care_history TO authenticated;
GRANT EXECUTE ON FUNCTION update_plant_care_dates() TO authenticated;