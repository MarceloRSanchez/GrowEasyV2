import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PlantDetailData } from './usePlantDetail';

interface LogFertilizingParams {
  userPlantId: string;
  grams?: number;
}

export function useLogFertilizing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPlantId, grams = 10 }: LogFertilizingParams) => {
      const { data, error } = await supabase
        .from('care_history')
        .insert({
          user_plant_id: userPlantId,
          action_type: 'fertilize',
          amount_ml: grams, // Using amount_ml field for grams
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
          
          const newGrowthPercent = Math.min(100, old.plant.growth_percent + 5);
          const nextFertilizingDue = new Date();
          nextFertilizingDue.setDate(nextFertilizingDue.getDate() + 14);

          return {
            ...old,
            plant: {
              ...old.plant,
              growth_percent: newGrowthPercent,
              last_fertilized: new Date().toISOString(),
              next_fertilizing_due: nextFertilizingDue.toISOString(),
              next_actions: old.plant.next_actions.map(action => 
                action.type === 'fertilize' 
                  ? { ...action, label: 'Well fertilized!', status: 'scheduled' as const }
                  : action
              ),
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
                  nextActionLabel: 'Well fertilized!',
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