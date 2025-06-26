import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface HomeSnapshotData {
  ecoScore: number;
  deltaWeek: number;
  streakDays: number;
  litersSaved: number;
  plants: Array<{
    id: string;
    name: string;
    photoUrl: string;
    species: string;
    progressPct: number;
    nextActionLabel: string;
    nextActionColor: string;
  }>;
  todayCare?: {
    taskLabel: string;
    plants: string[];
  };
}

interface UseHomeSnapshotResult {
  data: HomeSnapshotData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useHomeSnapshot(userId?: string): UseHomeSnapshotResult {
  const fetchHomeSnapshot = async (): Promise<HomeSnapshotData> => {
    if (!userId) {
      throw new Error('Missing userId');
    }

    const { data: result, error: rpcError } = await supabase
      .rpc('get_home_snapshot', { p_uid: userId });

    if (rpcError) {
      throw new Error(rpcError.message);
    }

    if (result) {
      return result as HomeSnapshotData;
    } else {
      // Return empty state if no data
      return {
        ecoScore: 0,
        deltaWeek: 0,
        streakDays: 0,
        litersSaved: 0,
        plants: [],
      };
    }
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['homeSnapshot'],
    queryFn: fetchHomeSnapshot,
    enabled: !!userId,
  });

  return {
    data: data || null,
    loading: isLoading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
}