/*
  # Add more seed data to plants table

  1. New Plants
    - Adds 15 new plants to the plants table with diverse categories
    - Includes detailed care information and growing tips
    - Provides realistic image URLs from Pexels
  
  2. Data Diversity
    - Covers all plant categories: herb, vegetable, fruit, flower, succulent
    - Includes plants with varying difficulty levels
    - Provides diverse care schedules and growing requirements
*/

-- Add more seed data to the plants table
INSERT INTO plants (name, scientific_name, image_url, category, difficulty, care_schedule, growth_time, sunlight, water_needs, tips)
VALUES
  -- Herbs
  ('Rosemary', 'Rosmarinus officinalis', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800', 'herb', 'intermediate', 
   '{"watering": 7, "fertilizing": 30}', 90, 'high', 'low', 
   ARRAY['Prefers dry conditions', 'Prune regularly to encourage bushy growth', 'Harvest outer stems first']),
  
  ('Thyme', 'Thymus vulgaris', 'https://images.pexels.com/photos/6231774/pexels-photo-6231774.jpeg?auto=compress&cs=tinysrgb&w=800', 'herb', 'beginner', 
   '{"watering": 5, "fertilizing": 60}', 60, 'high', 'low', 
   ARRAY['Plant in well-draining soil', 'Trim after flowering', 'Drought tolerant once established']),
  
  ('Cilantro', 'Coriandrum sativum', 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=800', 'herb', 'beginner', 
   '{"watering": 2, "fertilizing": 14}', 45, 'medium', 'medium', 
   ARRAY['Bolts quickly in hot weather', 'Succession plant every 2-3 weeks', 'Harvest outer leaves first']),
  
  -- Vegetables
  ('Bell Pepper', 'Capsicum annuum', 'https://images.pexels.com/photos/4750256/pexels-photo-4750256.jpeg?auto=compress&cs=tinysrgb&w=800', 'vegetable', 'intermediate', 
   '{"watering": 2, "fertilizing": 14, "pruning": 21}', 90, 'high', 'medium', 
   ARRAY['Support with stakes or cages', 'Pinch early flowers for stronger plants', 'Harvest when fully colored for best flavor']),
  
  ('Carrot', 'Daucus carota', 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=800', 'vegetable', 'beginner', 
   '{"watering": 3, "fertilizing": 21}', 75, 'medium', 'medium', 
   ARRAY['Thin seedlings to 2 inches apart', 'Keep soil consistently moist', 'Loosen soil before planting']),
  
  ('Spinach', 'Spinacia oleracea', 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg?auto=compress&cs=tinysrgb&w=800', 'vegetable', 'beginner', 
   '{"watering": 2, "fertilizing": 14}', 45, 'medium', 'medium', 
   ARRAY['Grows best in cool weather', 'Harvest outer leaves first', 'Succession plant every 2-3 weeks']),
  
  ('Cucumber', 'Cucumis sativus', 'https://images.pexels.com/photos/2329440/pexels-photo-2329440.jpeg?auto=compress&cs=tinysrgb&w=800', 'vegetable', 'intermediate', 
   '{"watering": 1, "fertilizing": 14, "pruning": 14}', 60, 'high', 'high', 
   ARRAY['Train vines on trellis', 'Harvest regularly to encourage production', 'Keep soil consistently moist']),
  
  -- Fruits
  ('Blueberry', 'Vaccinium corymbosum', 'https://images.pexels.com/photos/1153655/pexels-photo-1153655.jpeg?auto=compress&cs=tinysrgb&w=800', 'fruit', 'advanced', 
   '{"watering": 3, "fertilizing": 30, "pruning": 365}', 730, 'high', 'medium', 
   ARRAY['Requires acidic soil (pH 4.5-5.5)', 'Prune in late winter', 'Protect from birds when fruiting']),
  
  ('Raspberry', 'Rubus idaeus', 'https://images.pexels.com/photos/59999/raspberries-fruits-fruit-berries-59999.jpeg?auto=compress&cs=tinysrgb&w=800', 'fruit', 'intermediate', 
   '{"watering": 2, "fertilizing": 30, "pruning": 180}', 365, 'high', 'medium', 
   ARRAY['Prune first-year canes to 4-5 feet', 'Remove second-year canes after fruiting', 'Support with trellis or stakes']),
  
  ('Lemon', 'Citrus limon', 'https://images.pexels.com/photos/952360/pexels-photo-952360.jpeg?auto=compress&cs=tinysrgb&w=800', 'fruit', 'advanced', 
   '{"watering": 5, "fertilizing": 60, "pruning": 180}', 1095, 'high', 'medium', 
   ARRAY['Protect from frost', 'Fertilize with citrus-specific fertilizer', 'Prune to maintain shape and airflow']),
  
  -- Flowers
  ('Sunflower', 'Helianthus annuus', 'https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=800', 'flower', 'beginner', 
   '{"watering": 3, "fertilizing": 30}', 90, 'high', 'medium', 
   ARRAY['Plant in full sun', 'Space 6 inches apart for smaller varieties', 'Stake tall varieties for support']),
  
  ('Lavender', 'Lavandula', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800', 'flower', 'intermediate', 
   '{"watering": 7, "fertilizing": 90, "pruning": 180}', 180, 'high', 'low', 
   ARRAY['Plant in well-draining soil', 'Prune after flowering', 'Avoid overwatering']),
  
  ('Marigold', 'Tagetes', 'https://images.pexels.com/photos/1381679/pexels-photo-1381679.jpeg?auto=compress&cs=tinysrgb&w=800', 'flower', 'beginner', 
   '{"watering": 3, "fertilizing": 30}', 60, 'high', 'medium', 
   ARRAY['Deadhead spent flowers', 'Repels garden pests', 'Drought tolerant once established']),
  
  -- Succulents
  ('Aloe Vera', 'Aloe barbadensis miller', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800', 'succulent', 'beginner', 
   '{"watering": 14, "fertilizing": 90}', 180, 'medium', 'low', 
   ARRAY['Allow soil to dry completely between waterings', 'Use well-draining soil', 'Protect from frost']),
  
  ('Jade Plant', 'Crassula ovata', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800', 'succulent', 'beginner', 
   '{"watering": 10, "fertilizing": 90}', 365, 'medium', 'low', 
   ARRAY['Allow soil to dry between waterings', 'Prune to maintain shape', 'Can be propagated from leaf or stem cuttings']),
  
  ('Echeveria', 'Echeveria elegans', 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800', 'succulent', 'beginner', 
   '{"watering": 14, "fertilizing": 90}', 180, 'high', 'low', 
   ARRAY['Water only when soil is completely dry', 'Provide bright, indirect light', 'Remove dead leaves from the base']);