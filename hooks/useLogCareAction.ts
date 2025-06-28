import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Platform, AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { updateEcoScoreOptimistically } from '@/utils/ecoScore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelTaskNotification } from '@/notifications/scheduler';

interface LogCareActionParams {
  taskId: string;
  userPlantId: string;
  actionType: 'water' | 'fertilize' | 'harvest';
  amount?: number | null;
  uncomplete?: boolean;
}

interface LogCareActionResult {
  success: boolean;
  eco_points_delta: number;
  task_id: string;
  user_plant_id: string;
  action_type: string;
  notification_id?: string;
}

// Queue for offline actions
const OFFLINE_QUEUE_KEY = '@GrowEasy:offlineActionQueue';

interface QueuedAction extends LogCareActionParams {
  timestamp: number;
}

export function useLogCareAction() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Function to add action to offline queue
  const addToOfflineQueue = async (action: LogCareActionParams) => {
    try {
      // Get existing queue
      const queueString = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: QueuedAction[] = queueString ? JSON.parse(queueString) : [];
      
      // Add new action with timestamp
      const queuedAction: QueuedAction = {
        ...action,
        timestamp: Date.now()
      };
      
      queue.push(queuedAction);
      
      // Save updated queue
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      
      console.log('Added action to offline queue', queuedAction);
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  };

  // Function to process offline queue
  const processOfflineQueue = async () => {
    try {
      const queueString = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!queueString) return;
      
      const queue: QueuedAction[] = JSON.parse(queueString);
      if (queue.length === 0) return;
      
      console.log(`Processing offline queue: ${queue.length} items`);
      
      // Clear queue immediately to prevent duplicate processing
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify([]));
      
      // Process each action
      for (const action of queue) {
        try {
          await supabase.rpc('log_care_action', {
            p_task_id: action.taskId,
            p_user_plant_id: action.userPlantId,
            p_action_type: action.actionType,
            p_amount_ml: action.amount || null,
            p_uncomplete: action.uncomplete || false
          });
          
          console.log('Processed offline action:', action);
        } catch (error) {
          console.error('Error processing offline action:', error);
        }
      }
      
      // Refresh data after processing queue
      queryClient.invalidateQueries({ queryKey: ['calendarTasks'] });
      queryClient.invalidateQueries({ queryKey: ['homeSnapshot'] });
    } catch (error) {
      console.error('Error processing offline queue:', error);
    }
  };

  // Listen for app state changes to process queue when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        processOfflineQueue();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  return useMutation({
    mutationFn: async ({
      taskId,
      userPlantId,
      actionType,
      amount,
      uncomplete = false
    }: LogCareActionParams): Promise<LogCareActionResult> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Trigger haptic feedback on mobile devices
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        // Web alternative - visual feedback is handled by the UI
        console.log('Care action logged (web)');
      }

      try {
        const { data, error } = await supabase.rpc('log_care_action', {
          p_task_id: taskId,
          p_user_plant_id: userPlantId,
          p_action_type: actionType,
          p_amount_ml: amount || null,
          p_uncomplete: uncomplete
        });

        if (error) {
          console.error('Error logging care action:', error);
          
          // Add to offline queue if network error
          if (error.message.includes('network') || error.message.includes('connection')) {
            await addToOfflineQueue({
              taskId,
              userPlantId,
              actionType,
              amount,
              uncomplete
            });
          }
          
          throw new Error(error.message);
        }

        // If task was completed, cancel any scheduled notification
        if (!uncomplete && data.notification_id) {
          cancelTaskNotification(data.notification_id);
        }

        return data;
      } catch (error: any) {
        // Handle offline case
        if (error.message.includes('network') || error.message.includes('connection')) {
          await addToOfflineQueue({
            taskId,
            userPlantId,
            actionType,
            amount,
            uncomplete
          });
          
          // Return mock data for optimistic updates
          return {
            success: true,
            eco_points_delta: uncomplete ? -1 : (actionType === 'water' ? 1 : actionType === 'fertilize' ? 2 : 3),
            task_id: taskId,
            user_plant_id: userPlantId,
            action_type: actionType
          };
        }
        
        throw error;
      }
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendarTasks'] });
      await queryClient.cancelQueries({ queryKey: ['homeSnapshot'] });
      await queryClient.cancelQueries({ queryKey: ['plant', variables.userPlantId] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(['calendarTasks']);
      const previousHomeData = queryClient.getQueryData(['homeSnapshot']);

      // Calculate eco points delta based on action type and whether we're uncompleting
      const ecoPointsDelta = variables.uncomplete
        ? -(variables.actionType === 'water' ? 1 : variables.actionType === 'fertilize' ? 2 : 3)
        : (variables.actionType === 'water' ? 1 : variables.actionType === 'fertilize' ? 2 : 3);
      
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
      updateEcoScoreOptimistically(queryClient, ecoPointsDelta);

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
        eco_delta: data.eco_points_delta,
        offline: false
      });
    },
  });
}