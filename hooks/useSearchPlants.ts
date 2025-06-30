import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useDebounce } from './useDebounce';

export interface PlantMeta {
  id: string;
  name: string;
  scientific_name: string | null;
  image_url: string;
  category: string;
  difficulty: string;
  care_schedule: any;
  growth_time: number;
  sunlight: string;
  water_needs: string;
  tips: string[];
  created_at: string;
  relevance_score?: number;
}

interface UseSearchPlantsResult {
  results: PlantMeta[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  refetch: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

const SEARCH_LIMIT = 20;

const getPopularPlants = async (): Promise<PlantMeta[]> => {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw new Error(error.message);
    return data || [];
  } catch (error: any) {
    console.error('Error fetching popular plants:', error);
    return [];
  }
};

export function useSearchPlants(query: string): UseSearchPlantsResult {
  const debouncedQuery = useDebounce(query.trim(), 300);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [allResults, setAllResults] = useState<PlantMeta[]>([]);
  const [currentOffset, setCurrentOffset] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to get popular plants
  const getPopularPlants = async (): Promise<PlantMeta[]> => {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data || [];
  };

  // Function to get total count of search results
  const getTotalCount = async (searchQuery: string): Promise<number> => {
    if (!searchQuery) return 0;
    
    try {
      const { data, error } = await supabase.rpc('search_plants_count', { 
        q: searchQuery 
      });
      
      if (error) throw error;
      return data || 0;
    } catch (error) {
      console.error('Error getting total count:', error);
      return 0;
    }
  };

  const searchPlants = async (searchQuery: string, offset: number = 0): Promise<PlantMeta[]> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    if (!searchQuery) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .rpc('search_plants', {
          q: searchQuery,
          search_limit: SEARCH_LIMIT,
          search_offset: offset,
        });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      // Don't throw error if request was aborted
      if (error.name === 'AbortError') {
        return [];
      }
      throw error;
    }
  };

  const {
    data: searchResults,
    isLoading,
    error,
    refetch: refetchQuery,
  } = useQuery({
    queryKey: debouncedQuery ? ['searchPlants', debouncedQuery] : ['popularPlants'],
    queryFn: () => debouncedQuery ? searchPlants(debouncedQuery, 0) : getPopularPlants(),
    enabled: true, // Always enabled to show popular plants by default
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get total count when query changes
  useEffect(() => {
    if (debouncedQuery) {
      getTotalCount(debouncedQuery).then(count => {
        setTotalCount(count);
      });
    } else {
      setTotalCount(0);
    }
  }, [debouncedQuery]);

  // Reset pagination when query changes
  useEffect(() => {
    if (debouncedQuery) {
      setCurrentOffset(0);
      setAllResults([]);
    }
  }, [debouncedQuery]);

  // Update results when search data changes
  useEffect(() => {
    if (searchResults) {
      if (currentOffset === 0) {
        // New search - replace all results
        setAllResults(searchResults);
      } else {
        // Pagination - append results
        setAllResults(prev => [...prev, ...searchResults]);
      }
      
      // Check if there are more pages
      setHasNextPage(searchResults.length === SEARCH_LIMIT);
    }
  }, [searchResults, currentOffset]);

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage || !debouncedQuery) {
      return;
    }

    setIsFetchingNextPage(true);
    try {
      const nextOffset = currentOffset + SEARCH_LIMIT;
      const nextResults = await searchPlants(debouncedQuery, nextOffset);
      
      setAllResults(prev => [...prev, ...nextResults]);
      setCurrentOffset(nextOffset);
      setHasNextPage(nextResults.length === SEARCH_LIMIT);
    } catch (error) {
      console.error('Error fetching next page:', error);
    } finally {
      setIsFetchingNextPage(false);
    }
  };

  const refetch = async () => {
    setCurrentOffset(0);
    setAllResults([]);
    await refetchQuery();
  };

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results: debouncedQuery ? allResults : (searchResults || []),
    isLoading: isLoading,
    error: error?.message || null,
    refetch,
    fetchNextPage,
    hasNextPage: debouncedQuery ? hasNextPage : false,
    isFetchingNextPage,
    totalCount: debouncedQuery ? totalCount : 0,
  };
}