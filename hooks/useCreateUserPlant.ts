import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateUserPlantParams {
  plantId: string;
  nickname: string;
  wateringDays: number;
  fertilizingDays: number;
}

interface CreateUserPlantResult {
  userPlantId: string;
}

export function useCreateUserPlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plantId, nickname, wateringDays, fertilizingDays }: CreateUserPlantParams): Promise<CreateUserPlantResult> => {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Call the RPC function
      const { data: userPlantId, error } = await supabase
        .rpc('create_user_plant', {
          p_user_id: user.id,
          p_plant_id: plantId,
          p_nickname: nickname.trim(),
          p_water_days: wateringDays,
          p_fertilize_days: fertilizingDays,
        });

      if (error) {
        throw new Error(error.message || 'Failed to create plant');
      }

      if (!userPlantId) {
        throw new Error('Failed to create plant - no ID returned');
      }

      return { userPlantId };
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['plant', data.userPlantId] });
      queryClient.invalidateQueries({ queryKey: ['userPlants'] });
      
      // Optionally pre-populate the plant detail cache
      // This ensures smooth navigation to the new plant
      queryClient.prefetchQuery({
        queryKey: ['plant', data.userPlantId],
        staleTime: 1000 * 60 * 5, // 5 minutes
      });
    },
    onError: (error) => {
      console.error('Failed to create user plant:', error);
    },
  });
}