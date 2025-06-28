import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface LogCareActionParams {
  taskId: string;
  userPlantId: string;
  actionType: 'water' | 'fertilize' | 'harvest';
  amount?: number;
  uncomplete?: boolean;
}

interface LogCareActionResult {
  success: boolean;
  eco_points_delta: number;
  task_id: string;
  user_plant_id: string;
  action_type: string;
}

export function useLogCareAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      userPlantId,
      actionType,
      amount,
      uncomplete,
    }: LogCareActionParams): Promise<LogCareActionResult> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Trigger haptic feedback on mobile devices
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const { data, error } = await supabase.rpc('log_care_action', {
        p_task_id: taskId,
        p_user_plant_id: userPlantId,
        p_action_type: actionType,
        p_amount_ml: amount || null,
        p_uncomplete: uncomplete || false,
      });

      if (error) {
        console.error('Error logging care action:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendarTasks'] });
      await queryClient.cancelQueries({ queryKey: ['homeSnapshot'] });
      await queryClient.cancelQueries({ queryKey: ['plant', variables.userPlantId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['calendarTasks']);
      const previousHomeData = queryClient.getQueryData(['homeSnapshot']);

      // Optimistically update calendar tasks
      queryClient.setQueriesData({ queryKey: ['calendarTasks'] }, (old: any) => {
        if (!old) return old;

        // Deep clone to avoid mutating the cache directly
        const newData = JSON.parse(JSON.stringify(old));
        
        // Find and update the task
        Object.keys(newData).forEach(date => {
          newData[date] = newData[date].map((task: any) => {
            if (task.id === variables.taskId) {
              return { ...task, completed: !variables.uncomplete };
            }
            return task;
          });
        });
        
        return newData;
      });

      // Optimistically update home snapshot eco score
      queryClient.setQueryData(['homeSnapshot'], (old: any) => {
        if (!old) return old;
        
        const ecoPointsDelta = 
          variables.actionType === 'water' ? (variables.uncomplete ? -1 : 1) :
          variables.actionType === 'fertilize' ? (variables.uncomplete ? -2 : 2) :
          variables.actionType === 'harvest' ? (variables.uncomplete ? -3 : 3) : 0;
        
        return {
          ...old,
          ecoScore: Math.max(0, old.ecoScore + ecoPointsDelta),
          deltaWeek: old.deltaWeek + ecoPointsDelta,
          streakDays: old.streakDays + 1,
        };
      });

      return { previousTasks, previousHomeData };
    },
    onError: (err, variables, context) => {
      // Revert optimistic updates on error
      if (context?.previousTasks) {
        queryClient.setQueryData(['calendarTasks'], context.previousTasks);
      }
      if (context?.previousHomeData) {
        queryClient.setQueryData(['homeSnapshot'], context.previousHomeData);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch affected queries
      queryClient.invalidateQueries({ queryKey: ['calendarTasks'] });
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
      queryClient.invalidateQueries({ queryKey: ['plant', data.user_plant_id] });
      
      // Log analytics event
      console.log('Analytics: task_completed', {
        action_type: data.action_type,
        eco_delta: data.eco_points_delta
      });
    },
  });
}