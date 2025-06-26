import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ArchivePlantParams {
  userPlantId: string;
}

export function useArchivePlant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userPlantId }: ArchivePlantParams) => {
      const { data, error } = await supabase
        .from('user_plants')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', userPlantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ userPlantId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['homeSnapshot'] });
      await queryClient.cancelQueries({ queryKey: ['plant', userPlantId] });

      // Snapshot previous values
      const previousHomeData = queryClient.getQueryData(['homeSnapshot']);

      // Optimistically remove plant from home snapshot
      queryClient.setQueryData(['homeSnapshot'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          plants: old.plants.filter((plant: any) => plant.id !== userPlantId),
        };
      });

      return { previousHomeData };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousHomeData) {
        queryClient.setQueryData(['homeSnapshot'], context.previousHomeData);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['plant', variables.userPlantId] });
    },
  });
}