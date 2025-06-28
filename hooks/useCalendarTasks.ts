import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CareReminder } from '@/types/Plant';
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface TasksByDate {
  [date: string]: CareReminder[];
}

interface UseCalendarTasksResult {
  tasks: TasksByDate;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCalendarTasks(
  startDate: string,
  endDate: string
): UseCalendarTasksResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );

  // Listen for app state changes to refresh data when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground
        refetch();
      }
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, [appState]);

  const fetchTasks = async (): Promise<TasksByDate> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const { data, error } = await supabase.rpc('get_tasks_by_range', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data || {};
    } catch (error: any) {
      console.error('Error fetching calendar tasks:', error);
      
      // If offline, try to get from cache
      const cachedData = queryClient.getQueryData<TasksByDate>([
        'calendarTasks',
        user.id,
        startDate,
        endDate,
      ]);
      
      if (cachedData) {
        return cachedData;
      }
      
      throw error;
    }
  };

  const {
    data: tasks = {},
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: ['calendarTasks', user?.id, startDate, endDate],
    queryFn: fetchTasks,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refetch = async () => {
    await refetchQuery();
  };

  return {
    tasks,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}