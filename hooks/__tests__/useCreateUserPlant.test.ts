import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateUserPlant } from '../useCreateUserPlant';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    rpc: jest.fn(),
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

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

const mockCreateParams = {
  plantId: 'plant-123',
  nickname: 'My Sweet Basil',
  wateringDays: 2,
  fertilizingDays: 14,
};

describe('useCreateUserPlant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful auth by default
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  it('should create user plant successfully', async () => {
    const mockUserPlantId = 'user-plant-123';
    
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockUserPlantId,
      error: null,
    });

    const { result } = renderHook(() => useCreateUserPlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateParams);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual({ userPlantId: mockUserPlantId });
    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_user_plant', {
      p_user_id: mockUser.id,
      p_plant_id: mockCreateParams.plantId,
      p_nickname: mockCreateParams.nickname,
      p_water_days: mockCreateParams.wateringDays,
      p_fertilize_days: mockCreateParams.fertilizingDays,
    });
  });

  it('should handle authentication error', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { result } = renderHook(() => useCreateUserPlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Authentication required');
  });

  it('should handle RPC error', async () => {
    const errorMessage = 'Nickname must be between 2 and 24 characters';
    
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useCreateUserPlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should handle missing user plant ID', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => useCreateUserPlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockCreateParams);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Failed to create plant - no ID returned');
  });

  it('should trim nickname before sending', async () => {
    const mockUserPlantId = 'user-plant-123';
    
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockUserPlantId,
      error: null,
    });

    const { result } = renderHook(() => useCreateUserPlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      ...mockCreateParams,
      nickname: '  My Sweet Basil  ', // With extra spaces
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('create_user_plant', {
      p_user_id: mockUser.id,
      p_plant_id: mockCreateParams.plantId,
      p_nickname: 'My Sweet Basil', // Trimmed
      p_water_days: mockCreateParams.wateringDays,
      p_fertilize_days: mockCreateParams.fertilizingDays,
    });
  });

  it('should handle loading state correctly', () => {
    mockSupabase.rpc.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { result } = renderHook(() => useCreateUserPlant(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    result.current.mutate(mockCreateParams);

    expect(result.current.isLoading).toBe(true);
  });
});