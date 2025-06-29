import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { UserProfile, UpdateProfileParams } from '@/types/Profile';
import { useAuth } from './useAuth';

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchProfile = async (): Promise<UserProfile> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase.rpc('get_or_create_profile');

    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error(error.message);
    }

    return data[0] as UserProfile;
  };

  const profileQuery = useQuery({
    queryKey: ['userProfile', user?.id],
    queryFn: fetchProfile,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const updateProfile = useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update(params)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error(error.message);
      }

      return data;
    },
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userProfile', user?.id] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(['userProfile', user?.id]);

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(['userProfile', user?.id], {
          ...previousProfile,
          ...newProfile,
        });
      }

      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData<UserProfile>(
          ['userProfile', user?.id],
          context.previousProfile
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync with server
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateProfile,
    refetch: profileQuery.refetch,
  };
}