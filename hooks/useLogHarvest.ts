import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { PlantDetailData } from './usePlantDetail';

interface LogHarvestParams {
  userPlantId: string;
  weightGr?: number;
}

export function useLogHarvest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPlantId, weightGr = 100 }: LogHarvestParams) => {
      const { data, error } = await supabase
        .from('care_history')
        .insert({
          user_plant_id: userPlantId,
          action_type: 'harvest',
          amount_ml: weightGr, // Using amount_ml field for weight in grams
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
          
          // Harvesting completes the growth cycle
          const newGrowthPercent = 100;

          return {
            ...old,
            plant: {
              ...old.plant,
              growth_percent: newGrowthPercent,
              next_actions: old.plant.next_actions.filter(action => action.type !== 'harvest'),
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
                  progressPct: 100,
                  nextActionLabel: 'Harvest complete!',
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