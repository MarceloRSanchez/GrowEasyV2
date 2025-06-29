import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface AddCommentParams {
  postId: string;
  content: string;
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: AddCommentParams): Promise<string> => {
      const { data, error } = await supabase.rpc('add_post_comment', {
        p_post_id: postId,
        p_content: content,
      });

      if (error) {
        throw new Error(error.message);
      }

      return data as string; // Returns the new comment ID
    },
    onSuccess: (_, variables) => {
      // Invalidate the comments query to refetch with the new comment
      queryClient.invalidateQueries({ queryKey: ['postComments', variables.postId] });
      
      // Invalidate the feed posts query to update comment counts
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
    },
    onError: (error) => {
      console.error('Error adding comment:', error);
    },
  });
}