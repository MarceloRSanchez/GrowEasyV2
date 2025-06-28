import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';

export interface NewPostPayload {
  photoUri: string;
  caption: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoUri, caption }: NewPostPayload) => {
      // 1. Upload photo to storage
      const fileExt = photoUri.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      
      // Prepare file for upload
      let file;
      if (Platform.OS === 'web') {
        // For web, fetch the file and convert to blob
        const response = await fetch(photoUri);
        file = await response.blob();
      } else {
        // For native, use the URI directly
        file = {
          uri: photoUri,
          name: fileName,
          type: `image/${fileExt}`,
        };
      }
      
      // Upload to Supabase Storage
      const { data: uploadData, error: upErr } = await supabase
        .storage
        .from('post-photos')
        .upload(fileName, file, {
          cacheControl: 'public, max-age=604800', // 7 days
          contentType: `image/${fileExt}`,
        });

      if (upErr) {
        console.error('Upload error:', upErr);
        throw new Error('Failed to upload image. Please try again.');
      }

      // Get public URL for the uploaded image
      const { data: { publicUrl } } = supabase
        .storage
        .from('post-photos')
        .getPublicUrl(uploadData.path);

      // 2. Insert post record in database
      const { data, error } = await supabase
        .from('posts')
        .insert({
          photo_url: publicUrl,
          caption,
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw new Error('Failed to create post. Please try again.');
      }

      // Log analytics event
      console.log('Analytics: post_create_success', { postId: data.id });

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch feed posts query
      queryClient.invalidateQueries({ queryKey: ['feedPosts'] });
    },
  });
}