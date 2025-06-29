import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export function useAvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const pickImage = async () => {
    try {
      // Reset error state
      setError(null);
      
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        setError('Permission to access media library is required');
        return null;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }
      
      return result.assets[0];
    } catch (e) {
      console.error('Error picking image:', e);
      setError('Failed to pick image');
      return null;
    }
  };

  const uploadAvatar = async () => {
    if (!user) {
      setError('You must be logged in to upload an avatar');
      return null;
    }
    
    try {
      setUploading(true);
      setError(null);
      
      // Pick an image
      const imageAsset = await pickImage();
      if (!imageAsset) {
        setUploading(false);
        return null;
      }
      
      // Get image data
      const uri = imageAsset.uri;
      
      // For web: fetch the image and convert to blob
      let file;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        file = await response.blob();
      } else {
        // For native: convert uri to blob (would need additional handling)
        // This is a simplified version for web
        const response = await fetch(uri);
        file = await response.blob();
      }
      
      // Use user ID as the filename (no file extension)
      const fileName = user.id;
      
      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        setError('Failed to upload avatar');
        return null;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      // Update user profile with avatar URL
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
    } catch (e) {
      console.error('Error uploading avatar:', e);
      setError('Failed to upload avatar');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadAvatar,
    uploading,
    error
  };
}