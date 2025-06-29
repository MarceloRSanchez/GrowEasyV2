import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

interface CommentsPage {
  comments: Comment[];
  nextPage: number | null;
}

export function usePostComments(postId: string, pageSize: number = 20) {
  return useInfiniteQuery({
    queryKey: ['postComments', postId],
    queryFn: async ({ pageParam = 0 }): Promise<CommentsPage> => {
      const { data, error } = await supabase.rpc('get_post_comments', {
        p_post_id: postId,
        p_limit: pageSize,
        p_offset: pageParam,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        comments: data as Comment[],
        nextPage: data.length === pageSize ? pageParam + pageSize : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
}