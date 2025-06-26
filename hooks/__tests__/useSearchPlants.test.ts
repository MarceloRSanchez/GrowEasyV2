import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useSearchPlants } from '../useSearchPlants';
import { supabase } from '@/lib/supabase';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock debounce hook to return immediate value for testing
jest.mock('../useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

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

const mockPlantResults = [
  {
    id: '1',
    name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    image_url: 'https://example.com/basil.jpg',
    category: 'herb',
    difficulty: 'beginner',
    care_schedule: { watering: 2 },
    growth_time: 60,
    sunlight: 'high',
    water_needs: 'medium',
    tips: ['Pinch flowers'],
    created_at: '2024-01-01',
    relevance_score: 0.9,
  },
  {
    id: '2',
    name: 'Mint',
    scientific_name: 'Mentha',
    image_url: 'https://example.com/mint.jpg',
    category: 'herb',
    difficulty: 'beginner',
    care_schedule: { watering: 2 },
    growth_time: 45,
    sunlight: 'medium',
    water_needs: 'high',
    tips: ['Grows fast'],
    created_at: '2024-01-01',
    relevance_score: 0.8,
  },
];

describe('useSearchPlants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty results for empty query', async () => {
    const { result } = renderHook(() => useSearchPlants(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should return search results for valid query', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockPlantResults,
      error: null,
    });

    const { result } = renderHook(() => useSearchPlants('basil'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockPlantResults);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockSupabase.rpc).toHaveBeenCalledWith('search_plants', {
      q: 'basil',
      search_limit: 20,
      search_offset: 0,
    });
  });

  it('should handle search errors', async () => {
    const errorMessage = 'Search failed';
    mockSupabase.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useSearchPlants('invalid'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });

    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle pagination with fetchNextPage', async () => {
    // First page
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockPlantResults,
      error: null,
    });

    const { result } = renderHook(() => useSearchPlants('herb'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockPlantResults);
    });

    expect(result.current.hasNextPage).toBe(true); // 20 results = has next page

    // Second page
    const secondPageResults = [
      {
        ...mockPlantResults[0],
        id: '3',
        name: 'Oregano',
      },
    ];

    mockSupabase.rpc.mockResolvedValueOnce({
      data: secondPageResults,
      error: null,
    });

    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.results).toEqual([...mockPlantResults, ...secondPageResults]);
    });

    expect(mockSupabase.rpc).toHaveBeenCalledWith('search_plants', {
      q: 'herb',
      search_limit: 20,
      search_offset: 20,
    });
  });

  it('should reset results when query changes', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockPlantResults,
      error: null,
    });

    const { result, rerender } = renderHook(
      ({ query }) => useSearchPlants(query),
      {
        wrapper: createWrapper(),
        initialProps: { query: 'basil' },
      }
    );

    await waitFor(() => {
      expect(result.current.results).toEqual(mockPlantResults);
    });

    // Change query
    const newResults = [mockPlantResults[1]]; // Only mint
    mockSupabase.rpc.mockResolvedValueOnce({
      data: newResults,
      error: null,
    });

    rerender({ query: 'mint' });

    await waitFor(() => {
      expect(result.current.results).toEqual(newResults);
    });
  });

  it('should handle refetch', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: mockPlantResults,
      error: null,
    });

    const { result } = renderHook(() => useSearchPlants('basil'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.results).toEqual(mockPlantResults);
    });

    // Mock refetch with updated data
    const updatedResults = [...mockPlantResults, { ...mockPlantResults[0], id: '3' }];
    mockSupabase.rpc.mockResolvedValueOnce({
      data: updatedResults,
      error: null,
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.results).toEqual(updatedResults);
    });
  });
});