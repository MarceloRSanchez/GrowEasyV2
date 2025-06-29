import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Camera, User } from 'lucide-react-native';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange?: (url: string) => void;
  size?: number;
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onAvatarChange,
  size = 80 
}: AvatarUploadProps) {
  const { uploadAvatar, uploading, error } = useAvatarUpload();

  const handleUpload = async () => {
    const url = await uploadAvatar();
    if (url && onAvatarChange) {
      onAvatarChange(url);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]} 
        onPress={handleUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : currentAvatarUrl ? (
          <Image 
            source={{ uri: currentAvatarUrl }} 
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} 
          />
        ) : (
          <User size={size * 0.5} color={Colors.textMuted} />
        )}
        
        <View style={styles.cameraIconContainer}>
          <Camera size={size * 0.25} color={Colors.white} />
        </View>
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    backgroundColor: Colors.bgLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  avatar: {
    resizeMode: 'cover',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});