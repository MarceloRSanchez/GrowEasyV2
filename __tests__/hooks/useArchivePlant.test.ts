import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useArchivePlant } from '@/hooks/useArchivePlant';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
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

const mockUserPlantId = 'user-plant-123';

describe('useArchivePlant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should archive plant successfully', async () => {
    const mockArchivedPlant = {
      id: mockUserPlantId,
      is_active: false,
      updated_at: '2024-01-01T00:00:00Z',
    };

    // Mock the chain of Supabase calls
    const mockSingle = jest.fn().mockResolvedValue({
      data: mockArchivedPlant,
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ update: mockUpdate } as any);

    const { result } = renderHook(() => useArchivePlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userPlantId: mockUserPlantId });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockArchivedPlant);
    expect(mockSupabase.from).toHaveBeenCalledWith('user_plants');
    expect(mockUpdate).toHaveBeenCalledWith({
      is_active: false,
      updated_at: expect.any(String),
    });
    expect(mockEq).toHaveBeenCalledWith('id', mockUserPlantId);
  });

  it('should handle archive error', async () => {
    const errorMessage = 'Plant not found';
    
    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ update: mockUpdate } as any);

    const { result } = renderHook(() => useArchivePlant(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userPlantId: mockUserPlantId });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should handle optimistic updates correctly', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set initial home snapshot data
    const initialHomeData = {
      plants: [
        { id: mockUserPlantId, name: 'Test Plant' },
        { id: 'other-plant', name: 'Other Plant' },
      ],
    };
    queryClient.setQueryData(['homeSnapshot'], initialHomeData);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const mockSingle = jest.fn().mockResolvedValue({
      data: { id: mockUserPlantId, is_active: false },
      error: null,
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ update: mockUpdate } as any);

    const { result } = renderHook(() => useArchivePlant(), { wrapper });

    result.current.mutate({ userPlantId: mockUserPlantId });

    // Check optimistic update
    const updatedData = queryClient.getQueryData(['homeSnapshot']) as any;
    expect(updatedData.plants).toHaveLength(1);
    expect(updatedData.plants[0].id).toBe('other-plant');

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should rollback optimistic update on error', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Set initial home snapshot data
    const initialHomeData = {
      plants: [
        { id: mockUserPlantId, name: 'Test Plant' },
        { id: 'other-plant', name: 'Other Plant' },
      ],
    };
    queryClient.setQueryData(['homeSnapshot'], initialHomeData);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );

    const mockSingle = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Archive failed' },
    });
    const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
    const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
    const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ update: mockUpdate } as any);

    const { result } = renderHook(() => useArchivePlant(), { wrapper });

    result.current.mutate({ userPlantId: mockUserPlantId });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Check that data was rolled back
    const rolledBackData = queryClient.getQueryData(['homeSnapshot']) as any;
    expect(rolledBackData.plants).toHaveLength(2);
    expect(rolledBackData.plants.find((p: any) => p.id === mockUserPlantId)).toBeTruthy();
  });
});