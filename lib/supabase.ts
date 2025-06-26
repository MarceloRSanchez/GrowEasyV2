import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
  console.warn('⚠️  Supabase configuration incomplete. Please update your .env file with actual Supabase credentials.');
  console.warn('📝 Instructions:');
  console.warn('1. Go to https://supabase.com/dashboard');
  console.warn('2. Select your project (or create a new one)');
  console.warn('3. Go to Settings > API');
  console.warn('4. Copy the Project URL and anon/public key');
  console.warn('5. Update the values in your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for our database schema
export interface Database {
  public: {
    Tables: {
      plants: {
        Row: {
          id: string;
          name: string;
          scientific_name: string | null;
          image_url: string;
          category: string;
          difficulty: string;
          care_schedule: any;
          growth_time: number;
          sunlight: string;
          water_needs: string;
          tips: string[];
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['plants']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['plants']['Insert']>;
      };
      user_plants: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string;
          nickname: string;
          sow_date: string;
          growth_percent: number;
          location: string | null;
          notes: string | null;
          is_active: boolean;
          last_watered: string | null;
          last_fertilized: string | null;
          next_watering_due: string | null;
          next_fertilizing_due: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_plants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_plants']['Insert']>;
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          eco_points: number;
          delta_week: number;
          streak_days: number;
          liters_saved: number;
          plants_grown: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_stats']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>;
      };
    };
    Functions: {
      get_home_snapshot: {
        Args: { p_uid: string };
        Returns: {
          ecoScore: number;
          deltaWeek: number;
          streakDays: number;
          litersSaved: number;
          plants: Array<{
            id: string;
            name: string;
            photoUrl: string;
            species: string;
            progressPct: number;
            nextActionLabel: string;
            nextActionColor: string;
          }>;
          todayCare?: {
            taskLabel: string;
            plants: string[];
          };
        };
      };
      get_plant_detail: {
        Args: { p_user_plant_id: string; p_user_id: string };
        Returns: {
          plant: {
            id: string;
            nickname: string;
            growth_percent: number;
            sow_date: string;
            location: string | null;
            notes: string | null;
            is_active: boolean;
            last_watered: string | null;
            last_fertilized: string | null;
            next_watering_due: string | null;
            next_fertilizing_due: string | null;
            next_actions: Array<{
              type: string;
              label: string;
              due_date: string;
              status: 'overdue' | 'upcoming' | 'scheduled';
            }>;
            plant: {
              id: string;
              name: string;
              scientific_name: string | null;
              image_url: string;
              category: string;
              difficulty: string;
              care_schedule: any;
              growth_time: number;
              sunlight: string;
              water_needs: string;
              tips: string[];
            };
          };
          analytics: {
            waterHistory: Array<{
              date: string;
              ml: number;
            }>;
            sunExposure: Array<{
              date: string;
              hours: number;
            }>;
            soilHumidity: number | null;
          };
          notes: Array<{
            id: string;
            imageUrl: string | null;
            caption: string | null;
            createdAt: string;
          }>;
        };
      };
    };
  };
}