import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCalendarTasks } from '@/hooks/useCalendarTasks';
import { supabase } from '@/lib/supabase';
import { AppState } from 'react-native';

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
  };
});

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

const mockTasksData = {
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
  '2025-06-22': [
    {
      id: 'task-2',
      userPlantId: 'plant-2',
      type: 'fertilizing',
      dueDate: '2025-06-22',
      completed: false,
      notes: 'Fertilize the tomato plant',
    },
  ],
};

describe('useCalendarTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch tasks for the given date range', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockTasksData,
      error: null,
    });

    const { result } = renderHook(
      () => useCalendarTasks('2025-06-01', '2025-06-30'),
      { wrapper: createWrapper() }
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tasks).toEqual(mockTasksData);
    expect(result.current.error).toBeNull();
    expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'get_tasks_by_range',
      {
        p_user_id: 'test-user-id',
        p_start_date: '2025-06-01',
        p_end_date: '2025-06-30',
      }
    );
  });

  it('should handle errors when fetching tasks', async () => {
    const errorMessage = 'Failed to fetch tasks';
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(
      () => useCalendarTasks('2025-06-01', '2025-06-30'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tasks).toEqual({});
    expect(result.current.error).toBe(errorMessage);
  });

  it('should refetch data when app comes to foreground', async () => {
    mockSupabase.rpc.mockResolvedValue({
      data: mockTasksData,
      error: null,
    });

    const { result } = renderHook(
      () => useCalendarTasks('2025-06-01', '2025-06-30'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Simulate app going to background and then foreground
    const appStateListener = AppState.addEventListener as jest.Mock;
    const callback = appStateListener.mock.calls[0][1];
    
    // Simulate app coming to foreground
    callback('active');

    // Should have called refetch
    expect(mockSupabase.rpc).toHaveBeenCalledTimes(2);
  });

  it('should return cached data when offline', async () => {
    // First successful call to populate cache
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockTasksData,
      error: null,
    });

    const { result, rerender } = renderHook(
      () => useCalendarTasks('2025-06-01', '2025-06-30'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Second call fails (simulating offline)
    mockSupabase.rpc.mockRejectedValueOnce(new Error('Network error'));

    // Manually trigger refetch
    await result.current.refetch();

    // Should still have the cached data
    expect(result.current.tasks).toEqual(mockTasksData);
  });
});