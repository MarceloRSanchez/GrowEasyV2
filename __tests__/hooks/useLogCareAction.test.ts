import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLogCareAction } from '@/hooks/useLogCareAction';
import { supabase } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

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
        p_amount_ml: null,
      }
    );

    // Should trigger haptic feedback
    expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
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

  it('should update optimistically and revert on error', async () => {
    // Setup a query client with initial data
    const queryClient = new QueryClient();
    
    // Set initial calendar tasks data
    const initialTasks = {
      '2025-06-20': [
        {
          id: 'task-1',
          userPlantId: 'plant-1',
          type: 'watering',
          dueDate: '2025-06-20',
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