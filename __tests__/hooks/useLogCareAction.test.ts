import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogCareAction } from '../../hooks/useLogCareAction';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock AppState
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  return {
    ...reactNative,
    AppState: {
      ...reactNative.AppState,
      addEventListener: jest.fn((event, callback) => ({
        remove: jest.fn(),
      })),
      currentState: 'active',
    },
    Platform: {
      ...reactNative.Platform,
      OS: 'ios',
    },
  };
});

// Mock useAuth
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium',
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useLogCareAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should log care action successfully', async () => {
    const mockResult = {
      success: true,
      eco_points_delta: 2,
      task_id: 'task-1',
      user_plant_id: 'plant-1', 
      action_type: 'fertilize',
    };

    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockResult,
      error: null,
    });

    const { result } = renderHook(() => useLogCareAction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      taskId: 'task-1',
      userPlantId: 'plant-1',
      actionType: 'fertilize',
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResult);
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'log_care_action',
      {
        p_task_id: 'task-1',
        p_user_plant_id: 'plant-1',
        p_action_type: 'fertilize', 
        p_uncomplete: false,
        p_amount_ml: null,
      }
    );

    // Should trigger haptic feedback
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
  });
  
  it('should handle uncompleting a task', async () => {
    const mockResult = {
      success: true,
      eco_points_delta: -2, // Negative for uncomplete
      task_id: 'task-1',
      user_plant_id: 'plant-1',
      action_type: 'fertilize',
    };

    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockResult,
      error: null,
    });

    const { result } = renderHook(() => useLogCareAction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      taskId: 'task-1',
      userPlantId: 'plant-1',
      actionType: 'fertilize',
      uncomplete: true
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'log_care_action',
      expect.objectContaining({
        p_uncomplete: true
      })
    );
  });

  it('should handle errors when logging care action', async () => {
    const errorMessage = 'Failed to log care action';
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useLogCareAction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      taskId: 'task-1',
      userPlantId: 'plant-1',
      actionType: 'water',
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should add to offline queue when network error occurs', async () => {
    // Mock network error
    mockSupabase.rpc.mockRejectedValueOnce(new Error('Network error: Failed to fetch'));

    const { result } = renderHook(() => useLogCareAction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      taskId: 'task-1',
      userPlantId: 'plant-1',
      actionType: 'water',
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    // Check that the action was added to the offline queue
    const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
    expect(setItemCall[0]).toContain('offlineActionQueue');
    
    // Parse the queue data to verify it contains our action
    const queueData = JSON.parse(setItemCall[1]);
    expect(queueData[0].taskId).toBe('task-1');
    expect(queueData[0].actionType).toBe('water');
  });

  it('should process the offline queue when app comes to foreground', async () => {
    // Setup mock queue in AsyncStorage
    const mockQueue = [
      {
        taskId: 'task-1',
        userPlantId: 'plant-1',
        actionType: 'water',
        timestamp: Date.now()
      }
    ];
    
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockQueue));
    mockSupabase.rpc.mockResolvedValueOnce({
      data: { success: true },
      error: null
    });

    // Render the hook to set up the AppState listener
    renderHook(() => useLogCareAction(), {
      wrapper: createWrapper(),
    });

    // Simulate app coming to foreground
    const appStateListener = AppState.addEventListener as jest.Mock;
    const callback = appStateListener.mock.calls[0][1];
    callback('active');

    // Wait for queue processing
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        expect.stringContaining('offlineActionQueue'),
        expect.stringContaining('[]')
      );
    });

    // Verify RPC was called to process the queued action
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'log_care_action',
      expect.objectContaining({
        p_task_id: 'task-1',
        p_user_plant_id: 'plant-1',
        p_action_type: 'water'
      })
    );
  });

  it('should update optimistically and revert on error', async () => {
    // Setup a query client with initial data
    const queryClient = new QueryClient();
    
    // Set initial calendar tasks data
    const initialTasks = {
      '2025-06-20': [
        {
          id: 'task-1',
          user_plant_id: 'plant-1',
          type: 'watering',
          due_date: '2025-06-20',
          completed: false,
          notes: 'Water the basil plant',
        },
      ],
    };
    
    queryClient.setQueryData(['calendarTasks', 'test-user-id', '2025-06-01', '2025-06-30'], initialTasks);
    
    // Set initial home snapshot data
    const initialHomeData = {
      ecoScore: 100,
      deltaWeek: 10,
      streakDays: 5,
    };
    
    queryClient.setQueryData(['homeSnapshot'], initialHomeData);
    
    // Mock error response
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: 'Failed to log care action' },
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    const { result } = renderHook(() => useLogCareAction(), { wrapper });
    
    // Trigger mutation
    result.current.mutate({
      taskId: 'task-1',
      userPlantId: 'plant-1',
      actionType: 'water',
    });
    
    // Check optimistic update
    const updatedTasks = queryClient.getQueryData(['calendarTasks', 'test-user-id', '2025-06-01', '2025-06-30']);
    expect((updatedTasks as any)['2025-06-20'][0].completed).toBe(true); 
    
    const updatedHomeData = queryClient.getQueryData(['homeSnapshot']);
    expect((updatedHomeData as any).ecoScore).toBe(101); // +1 for water
    
    // Wait for error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    
    // Check rollback
    const rolledBackTasks = queryClient.getQueryData(['calendarTasks', 'test-user-id', '2025-06-01', '2025-06-30']);
    expect((rolledBackTasks as any)['2025-06-20'][0].completed).toBe(false); 
    
    const rolledBackHomeData = queryClient.getQueryData(['homeSnapshot']);
    expect((rolledBackHomeData as any).ecoScore).toBe(100);
  });
});