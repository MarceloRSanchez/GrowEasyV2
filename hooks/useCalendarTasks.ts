import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { CareReminder, TasksByDate } from '@/types/Plant';
import { useAuth } from './useAuth';
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseCalendarTasksResult {
  tasks: TasksByDate;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Key for caching tasks locally
const TASKS_CACHE_KEY = '@GrowEasy:tasksCache';

export function useCalendarTasks(
  startDate: string,
  endDate: string
): UseCalendarTasksResult {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const [isOnline, setIsOnline] = useState(true);

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

  // Function to save tasks to local cache
  const saveTasksToCache = async (tasks: TasksByDate, cacheKey: string) => {
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        tasks,
        timestamp: Date.now(),
        startDate,
        endDate
      }));
    } catch (error) {
      console.error('Error saving tasks to cache:', error);
    }
  };

  // Function to load tasks from local cache
  const loadTasksFromCache = async (cacheKey: string): Promise<TasksByDate | null> => {
    try {
      const cacheData = await AsyncStorage.getItem(cacheKey);
      if (!cacheData) return null;
      
      const { tasks, timestamp, startDate: cachedStart, endDate: cachedEnd } = JSON.parse(cacheData);
      
      // Check if cache is for the same date range
      if (cachedStart !== startDate || cachedEnd !== endDate) {
        return null;
      }
      
      // Check if cache is too old (more than 1 hour)
      if (Date.now() - timestamp > 60 * 60 * 1000) {
        return null;
      }
      
      return tasks;
    } catch (error) {
      console.error('Error loading tasks from cache:', error);
      return null;
    }
  };

  const fetchTasks = async (): Promise<TasksByDate> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate a cache key based on user and date range
    const cacheKey = `${TASKS_CACHE_KEY}:${user.id}:${startDate}:${endDate}`;

    try {
      const { data, error } = await supabase.rpc('get_tasks_by_range', {
        p_user_id: user.id,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Save successful response to cache
      if (data) {
        saveTasksToCache(data, cacheKey);
        setIsOnline(true);
      }

      return data || {};
    } catch (error: any) {
      console.error('Error fetching calendar tasks:', error);
      
      // Check if it's a network error
      const isNetworkError = error.message.includes('network') || 
                            error.message.includes('connection') ||
                            error.message.includes('offline');
      
      if (isNetworkError) {
        setIsOnline(false);
      }
      
      // Try to get from cache
      const cachedData = await loadTasksFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached tasks data');
        return cachedData;
      }
      
      // If no cache and it's a network error, return empty object instead of throwing
      if (isNetworkError) {
        return {};
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