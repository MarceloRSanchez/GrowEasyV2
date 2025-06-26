import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface PlantDetailData {
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
}

interface UsePlantDetailResult {
  data: PlantDetailData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlantDetail(userPlantId: string, userId?: string): UsePlantDetailResult {
  const fetchPlantDetail = async (): Promise<PlantDetailData> => {
    if (!userPlantId || !userId) {
      throw new Error('Missing userPlantId or userId');
    }

    const { data: result, error: rpcError } = await supabase
      .rpc('get_plant_detail', { 
        p_user_plant_id: userPlantId,
        p_user_id: userId 
      });

    if (rpcError) {
      throw new Error(rpcError.message);
    }

    if (!result) {
      throw new Error('Plant not found');
    }

    return result as PlantDetailData;
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['plant', userPlantId],
    queryFn: fetchPlantDetail,
    enabled: !!userPlantId && !!userId,
  });

  return {
    data: data || null,
    isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}