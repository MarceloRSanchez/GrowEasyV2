import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string;
  eco_points: number;
  plants_grown: number;
  rank: number;
}

export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: limit });
      if (error) throw error;
      return data as LeaderboardUser[];
    },
    staleTime: 60_000, // 1 minute
  });
}