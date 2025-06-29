import { useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface UseAvatarUploadResult {
  uploadAvatar: () => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useAvatarUpload(): UseAvatarUploadResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const uploadAvatar = async (): Promise<string | null> => {
    if (!user) {
      setError('You must be logged in to upload an avatar');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError('Permission to access gallery was denied');
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        setIsLoading(false);
        return null;
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
        setError('Failed to upload avatar');
        return null;
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
        setError('Failed to update profile');
        return null;
      }

      return publicUrl;
    } catch (err) {
      console.error('Error in avatar upload:', err);
      setError('An unexpected error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadAvatar,
    isLoading,
    error
  };
}