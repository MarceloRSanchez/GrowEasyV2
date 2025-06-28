import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  username: string;
  avatar_url: string | null;
}

interface UseFeedPostsOptions {
  pageSize?: number;
}

export function useFeedPosts({ pageSize = 20 }: UseFeedPostsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['feedPosts'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase.rpc('get_feed_posts', {
        p_limit: pageSize,
        p_offset: pageParam,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        posts: data as Post[],
        nextPage: data.length === pageSize ? pageParam + pageSize : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}