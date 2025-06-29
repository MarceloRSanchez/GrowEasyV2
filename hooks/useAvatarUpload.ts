import { useMutation } from '@tanstack/react-query';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

type UploadSource = 'camera' | 'library';

export function useAvatarUpload() {
  const { user } = useAuth();

  const uploadAvatar = useMutation({
    mutationFn: async (source: UploadSource): Promise<string> => {
      if (!user) {
        throw new Error('You must be logged in to upload an avatar');
      }

      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error('Permission to access gallery was denied');
      }

      let result;

      if (source === 'camera') {
        // Request camera permissions
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          throw new Error('Permission to access camera was denied');
        }

        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('Image selection was cancelled');
      }

      const imageUri = result.assets[0].uri;
      
      // Convert image to blob for upload
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Use user ID as the filename
      const fileName = user.id;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        throw new Error('Failed to upload avatar');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          avatar_url: publicUrl
        });

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error('Failed to update profile');
      }

      return publicUrl;
    },
  });

  return {
    uploadAvatar,
    isLoading: uploadAvatar.isPending,
    error: uploadAvatar.error?.message || null
  };
}