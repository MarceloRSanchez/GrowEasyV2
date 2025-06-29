import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';
import { Platform } from 'react-native';

// Helper function to convert data URL to Blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export interface NewPostPayload {
  photoUri: string;
  caption: string;
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ photoUri, caption }: NewPostPayload) => {
      if (!user) {
        throw new Error('User must be authenticated');
      }

      // 1. Upload photo to storage
      const fileExt = photoUri.split('.').pop() || 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      // Prepare file for upload
      let file;
      if (Platform.OS === 'web') {
        // For web, handle different URI types
        if (photoUri.startsWith('data:')) {
          // Handle data URLs by converting directly to Blob
          file = dataURLtoBlob(photoUri);
        } else if (photoUri.startsWith('blob:')) {
          // Handle blob URLs using XMLHttpRequest
          file = await new Promise<Blob>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', photoUri, true);
            xhr.responseType = 'blob';
            xhr.onload = () => {
              if (xhr.status === 200) {
                resolve(xhr.response);
              } else {
                reject(new Error(`Failed to load image: ${xhr.status}`));
              }
            };
            xhr.onerror = () => reject(new Error('Network error loading image'));
            xhr.send();
          });
        } else {
          // Fallback: try direct fetch for other URLs
          try {
            const response = await fetch(photoUri);
            file = await response.blob();
          } catch (error) {
            throw new Error('Unable to process image. Please try selecting a different image.');
          }
        }
      } else {
        // For native, use the URI directly
        file = {
          uri: photoUri,
          name: fileName,
          type: `image/${fileExt}`,
        } as any;
      }
      
      // Upload to Supabase Storage
      const { data: uploadData, error: upErr } = await supabase
        .storage
        .from('posts')
        .upload(filePath, file, {
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
        .from('posts')
        .getPublicUrl(uploadData.path);

      // 2. Insert post record in database
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
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