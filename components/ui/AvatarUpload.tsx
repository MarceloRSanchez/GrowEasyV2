import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarChange?: (url: string) => void;
  size?: number;
}

export function AvatarUpload({
  currentAvatarUrl,
  onAvatarChange,
  size = 80,
}: AvatarUploadProps) {
  const { uploadAvatar, isLoading, error } = useAvatarUpload();

  const handleUpload = async () => {
    const url = await uploadAvatar();
    if (url && onAvatarChange) {
      onAvatarChange(url);
    }
  };

  const defaultAvatarUrl = 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.avatarContainer,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onPress={handleUpload}
        disabled={isLoading}
      >
        <Image
          source={{ uri: currentAvatarUrl || defaultAvatarUrl }}
          style={[
            styles.avatar,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        />
        <View style={styles.uploadIconContainer}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Camera size={size / 4} color={Colors.white} />
          )}
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
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.bgLight,
  },
  avatar: {
    resizeMode: 'cover',
  },
  uploadIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
    margin: 2,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});