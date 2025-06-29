import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { Pencil, Camera, Image as ImageIcon } from 'lucide-react-native';

interface AvatarPickerProps {
  avatarUrl: string | null;
  size?: number;
  onAvatarChange?: (url: string) => void;
  disabled?: boolean;
}

export function AvatarPicker({
  avatarUrl,
  size = 80,
  onAvatarChange,
  disabled = false,
}: AvatarPickerProps) {
  const { uploadAvatar, isLoading } = useAvatarUpload();

  const handleAvatarPress = () => {
    if (disabled || isLoading) return;

    if (Platform.OS === 'web') {
      // On web, directly open file picker
      handlePickFromGallery();
    } else {
      // On native, show options
      Alert.alert(
        'Change Profile Picture',
        'Choose a new profile picture',
        [
          {
            text: 'Take Photo',
            onPress: handleTakePhoto,
          },
          {
            text: 'Choose from Gallery',
            onPress: handlePickFromGallery,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleTakePhoto = async () => {
    try {
      const publicUrl = await uploadAvatar.mutateAsync('camera');
      onAvatarChange?.(publicUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      console.error(error);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const publicUrl = await uploadAvatar.mutateAsync('library');
      onAvatarChange?.(publicUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
      console.error(error);
    }
  };

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.avatarContainer,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onPress={handleAvatarPress}
        disabled={disabled || isLoading}
        accessibilityLabel="Edit profile picture"
        accessibilityRole="button"
        accessibilityHint="Tap to change your profile picture"
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[
              styles.avatar,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholderAvatar,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <Text style={[styles.placeholderText, { fontSize: size / 2.5 }]}>
              {getInitials('User')}
            </Text>
          </View>
        )}
        
        {/* Edit button overlay */}
        {isLoading ? (
          <View style={styles.loadingButton}>
            <ActivityIndicator size="small" color={Colors.white} />
          </View>
        ) : (
          <View style={styles.editButton}>
            <Pencil size={16} color={Colors.white} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.bgLight,
  },
  avatar: {
    resizeMode: 'cover',
  },
  placeholderAvatar: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.white,
    fontWeight: '600',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  loadingButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});