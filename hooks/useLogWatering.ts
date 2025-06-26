import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PlantDetailData } from './usePlantDetail';

interface LogWateringParams {
  userPlantId: string;
  amountMl?: number;
}

export function useLogWatering() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPlantId, amountMl = 250 }: LogWateringParams) => {
      const { data, error } = await supabase
        .from('care_history')
        .insert({
          user_plant_id: userPlantId,
          action_type: 'water',
          amount_ml: amountMl,
          performed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ userPlantId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['plant', userPlantId] });
      await queryClient.cancelQueries({ queryKey: ['homeSnapshot'] });

      // Snapshot previous values
      const previousPlantData = queryClient.getQueryData<PlantDetailData>(['plant', userPlantId]);

      // Optimistically update plant detail
      if (previousPlantData) {
        queryClient.setQueryData<PlantDetailData>(['plant', userPlantId], (old) => {
          if (!old) return old;
          
          const newGrowthPercent = Math.min(100, old.plant.growth_percent + 2);
          const nextWateringDue = new Date();
          nextWateringDue.setDate(nextWateringDue.getDate() + 2);

          return {
            ...old,
            plant: {
              ...old.plant,
              growth_percent: newGrowthPercent,
              last_watered: new Date().toISOString(),
              next_watering_due: nextWateringDue.toISOString(),
              next_actions: old.plant.next_actions.map(action => 
                action.type === 'water' 
                  ? { ...action, label: 'Well watered!', status: 'scheduled' as const }
                  : action
              ),
            },
            analytics: {
              ...old.analytics,
              waterHistory: [
                { date: new Date().toISOString().split('T')[0], ml: 250 },
                ...old.analytics.waterHistory,
              ],
            },
          };
        });
      }

      // Optimistically update home snapshot
      queryClient.setQueryData(['homeSnapshot'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          plants: old.plants.map((plant: any) => 
            plant.id === userPlantId 
              ? { 
                  ...plant, 
                  progressPct: Math.min(100, plant.progressPct + 1),
                  nextActionLabel: 'Well watered!',
                  nextActionColor: '#10B981'
                }
              : plant
          ),
        };
      });

      return { previousPlantData };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousPlantData) {
        queryClient.setQueryData(['plant', variables.userPlantId], context.previousPlantData);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['plant', variables.userPlantId] });
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
    },
  });
}