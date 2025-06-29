import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { v4 as uuidv4 } from 'uuid';

export interface AvatarUploadOptions {
  maxWidth?: number;
  maxSizeKB?: number;
}

export function useAvatarUpload() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const pickImage = async (
    source: 'camera' | 'library',
    options: AvatarUploadOptions = {}
  ): Promise<string | null> => {
    const { maxWidth = 500, maxSizeKB = 512 } = options;

    try {
      // Request permissions first
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Camera permission not granted');
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          throw new Error('Media library permission not granted');
        }
      }

      // Launch camera or image picker
      const pickerResult = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images' as unknown as ImagePicker.MediaTypeOptions,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (pickerResult.canceled) {
        return null;
      }

      const selectedAsset = pickerResult.assets[0];
      
      // Process image - resize and compress
      const manipResult = await ImageManipulator.manipulateAsync(
        selectedAsset.uri,
        [{ resize: { width: maxWidth } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      return manipResult.uri;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  };

  const uploadAvatar = useMutation({
    mutationFn: async (uri: string): Promise<string> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Prepare file for upload
      const fileExt = uri.split('.').pop() || 'jpg';
      const uniqueName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user.id}/${uniqueName}`; // store inside user folder to satisfy RLS
      
      let file;
      if (Platform.OS === 'web') {
        // For web, fetch the file and convert to blob
        const response = await fetch(uri);
        file = await response.blob();
      } else {
        // For native, use the URI directly
        file = {
          uri,
          name: uniqueName,
          type: `image/${fileExt}`,
        } as any;
      }
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw new Error('Failed to upload avatar');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, avatar_url: publicUrl }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Profile upsert error:', upsertError);
        throw new Error('Failed to update profile with new avatar');
      }

      return publicUrl;
    },
    onMutate: async (uri) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userProfile', user?.id] });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(['userProfile', user?.id]);

      // Optimistically update to the new value
      queryClient.setQueryData(['userProfile', user?.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          avatar_url: uri, // Temporarily use local URI for optimistic update
        };
      });

      return { previousProfile };
    },
    onError: (err, uri, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProfile) {
        queryClient.setQueryData(['userProfile', user?.id], context.previousProfile);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure cache is in sync with server
      queryClient.invalidateQueries({ queryKey: ['userProfile', user?.id] });
    },
  });

  return {
    pickImage,
    uploadAvatar,
  };
}