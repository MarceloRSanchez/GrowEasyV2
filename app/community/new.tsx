import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { useCreatePost } from '@/hooks/useCreatePost';
import { Camera, X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_CAPTION_LENGTH = 280;
const MAX_IMAGE_SIZE_MB = 2;

export default function CreatePostScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const createPost = useCreatePost();

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access media library is required');
      }
    })();
    
    // Log analytics event
    console.log('Analytics: post_create_started');
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as ImagePicker.MediaTypeOptions,
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (result.canceled) {
        Alert.alert('Cancelled', 'Image selection was cancelled');
        return;
      }

      const selectedAsset = result.assets[0];
      
      // Check if image needs resizing
      const imageSizeInMB = selectedAsset.fileSize ? selectedAsset.fileSize / (1024 * 1024) : 0;
      
      if (imageSizeInMB > MAX_IMAGE_SIZE_MB) {
        // Resize image to reduce file size
        const resizedImage = await ImageManipulator.manipulateAsync(
          selectedAsset.uri,
          [{ resize: { width: 1200 } }], // Resize to max width of 1200px
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setPhotoUri(resizedImage.uri);
      } else {
        setPhotoUri(selectedAsset.uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to select image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!photoUri) {
      setError('Please select a photo');
      return;
    }

    if (!caption.trim()) {
      setError('Please add a caption');
      return;
    }

    try {
      await createPost.mutateAsync({
        photoUri,
        caption: caption.trim(),
      });
      
      // Success - navigate back to feed
      router.replace('/(tabs)/community');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
      
      // Log analytics event
      console.log('Analytics: post_create_error', { error: err });
    }
  };

  const isFormValid = photoUri && caption.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => router.replace('/(tabs)/community')}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <X size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.title}>New Post</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Error Toast */}
          {error && (
            <ErrorToast
              message={error}
              onDismiss={() => setError(null)}
              onRetry={pickImage}
            />
          )}

          {/* Image Picker */}
          <View style={styles.imageContainer}>
            {photoUri ? (
              <>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.changePhotoButton} 
                  onPress={pickImage}
                  accessibilityLabel="Change photo"
                  accessibilityRole="button"
                >
                  <Text style={styles.changePhotoText}>Change photo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.imagePicker} 
                onPress={pickImage}
                accessibilityLabel="Select a photo"
                accessibilityRole="button"
              >
                <View style={styles.imagePickerContent}>
                  <Camera size={48} color={Colors.primary} />
                  <Text style={styles.imagePickerText}>Select a photo</Text>
                  <Text style={styles.imagePickerSubtext}>
                    Choose a photo from your gallery
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Caption Input */}
          <View style={styles.captionContainer}>
            <Text style={styles.captionLabel}>Caption</Text>
            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor={Colors.textMuted}
              value={caption}
              onChangeText={setCaption}
              multiline
              maxLength={MAX_CAPTION_LENGTH}
              accessibilityLabel="Caption"
              accessibilityHint="Write a description of your photo"
            />
            <Text style={styles.characterCount}>
              {caption.length}/{MAX_CAPTION_LENGTH}
            </Text>
          </View>

          {/* Post Button */}
          <Button
            title="Post"
            onPress={handleSubmit}
            disabled={!isFormValid || createPost.isPending}
            loading={createPost.isPending}
            size="large"
            style={styles.postButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Loading Overlay */}
      <GlobalLoadingOverlay
        visible={createPost.isPending}
        message="Uploading post..."
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: Colors.bgLight,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  imageContainer: {
    marginBottom: Spacing.lg,
  },
  imagePicker: {
    height: 300,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePickerContent: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  imagePickerText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  imagePickerSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  previewImage: {
    width: '100%',
    height: 400,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  changePhotoText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
  captionContainer: {
    marginBottom: Spacing.lg,
  },
  captionLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  captionInput: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  characterCount: {
    ...Typography.caption,
    color: Colors.textMuted,
    alignSelf: 'flex-end',
    marginTop: Spacing.xs,
  },
  postButton: {
    marginTop: Spacing.md,
  },
});