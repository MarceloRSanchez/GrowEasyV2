import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast as ToastComponent } from '@/components/ui/Toast';
import { AnalysisLoading } from '@/components/diagnose/AnalysisLoading';
import { useToast } from '@/hooks/useToast';
import { DiagnosisCard } from '@/components/diagnose/DiagnosisCard';
import { DiagnosisDetailSheet } from '@/components/diagnose/DiagnosisDetailSheet';
import { DiagnosisEmptyState } from '@/components/diagnose/DiagnosisEmptyState';
import { useDiagnosePlant, DiagnosisResult } from '@/hooks/useDiagnosePlant';
import { useUserDiagnoses, DiagnosisItem } from '@/hooks/useUserDiagnoses';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Camera, Image as ImageIcon, Scan, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Lightbulb } from 'lucide-react-native';

export default function DiagnoseScreen() {
  // State
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisItem | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [galleryPermission, setGalleryPermission] = useState<boolean | null>(null);
  
  // Refs
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  
  // Hooks
  const { toast, showToast, hideToast } = useToast();
  const diagnoseMutation = useDiagnosePlant();
  const { 
    data: diagnoses, 
    isLoading: diagnosesLoading, 
    error: diagnosesError,
    refetch: refetchDiagnoses
  } = useUserDiagnoses();
  
  // Check permissions on mount
  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');
      
      const galleryStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(galleryStatus.status === 'granted');
    })();
  }, []);

  // Request permissions if needed
  const requestPermissions = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setGalleryPermission(status === 'granted');
      return status === 'granted';
    }
  };

  const handleTakePhoto = async () => {
    // Check/request camera permission
    if (!cameraPermission) {
      const granted = await requestPermissions('camera');
      if (!granted) {
        showToast('Camera permission is required to take photos', 'error');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        
        // Resize image to reduce file size
        const manipResult = await ImageManipulator.manipulateAsync(
          selectedAsset.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setSelectedImage(manipResult.uri);
        handleAnalyze(manipResult.uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showToast('Failed to take photo. Please try again.', 'error');
    }
  };

  const handleSelectFromGallery = async () => {
    // Check/request gallery permission
    if (!galleryPermission) {
      const granted = await requestPermissions('gallery');
      if (!granted) {
        showToast('Gallery permission is required to select photos', 'error');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        
        // Resize image to reduce file size
        const manipResult = await ImageManipulator.manipulateAsync(
          selectedAsset.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        setSelectedImage(manipResult.uri);
        handleAnalyze(manipResult.uri);
      }
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      showToast('Failed to select image. Please try again.', 'error');
    }
  };

  const handleAnalyze = async (uri: string) => {
    try {
      await diagnoseMutation.mutateAsync({ uri });
      showToast('Plant diagnosis complete!', 'success');
      setSelectedImage(null); // Reset selected image
      refetchDiagnoses(); // Refresh diagnoses list
    } catch (error) {
      console.error('Diagnosis error:', error);
      showToast('Failed to analyze plant. Please try again.', 'error');
    }
  };

  const handleDiagnosisPress = (diagnosis: DiagnosisItem) => {
    setSelectedDiagnosis(diagnosis);
    bottomSheetRef.current?.present();
  };

  const handleCloseDetailSheet = () => {
    setSelectedDiagnosis(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Plant Diagnosis</Text>
          <Text style={styles.subtitle}>
            AI-powered plant health analysis
          </Text>
        </View>

        {/* Camera Section */}
        <Card style={styles.cameraCard}>
          <View style={styles.cameraContainer}>
            {selectedImage ? (
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.selectedImage} 
                accessibilityLabel="Selected plant image"
              />
            ) : (
              <View style={styles.cameraPlaceholder}>
                <Scan size={64} color={Colors.primary} />
                <Text style={styles.cameraText}>Take a photo of your plant</Text>
                <Text style={styles.cameraSubtext}>
                  Position the affected area in the center
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cameraActions}>
            <Button
              title="Take Photo"
              onPress={handleTakePhoto} 
              variant="primary"
              style={styles.cameraButton}
              disabled={diagnoseMutation.isLoading}
            />
            <Button
              title="From Gallery"
              onPress={handleSelectFromGallery}
              variant="outline"
              style={styles.cameraButton}
              disabled={diagnoseMutation.isLoading}
            />
          </View>
          <View>
            <Text style={styles.tip}>• Use natural lighting when possible</Text>
            <Text style={styles.tip}>• Focus on the affected leaves or areas</Text>
            <Text style={styles.tip}>• Keep the camera steady and close</Text>
            <Text style={styles.tip}>• Include surrounding healthy parts for comparison</Text>
          </View>
        </Card>

        {/* Recent Diagnoses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Diagnoses</Text>
          
          {diagnosesLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading diagnoses...</Text>
            </View>
          ) : diagnosesError ? (
            <Card style={styles.errorCard}>
              <AlertTriangle size={24} color={Colors.error} />
              <Text style={styles.errorText}>Failed to load diagnoses</Text>
              <Button 
                title="Retry" 
                onPress={() => refetchDiagnoses()} 
                variant="outline"
                size="small"
                style={styles.retryButton}
              />
            </Card>
          ) : diagnoses && diagnoses.length > 0 ? (
            diagnoses.map((diagnosis) => (
              <DiagnosisCard
                key={diagnosis.id}
                diagnosis={diagnosis}
                onPress={handleDiagnosisPress}
              />
            ))
          ) : (
            <DiagnosisEmptyState onTakePhoto={handleTakePhoto} />
          )}
        </View>
      </ScrollView>

      <DiagnosisDetailSheet
        diagnosis={selectedDiagnosis}
        isVisible={!!selectedDiagnosis}
        onClose={handleCloseDetailSheet}
        bottomSheetRef={bottomSheetRef}
      />
      
      <AnalysisLoading visible={diagnoseMutation.isLoading} />
      
      <ToastComponent
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  cameraCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cameraContainer: {
    marginBottom: Spacing.md,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  cameraPlaceholder: {
    height: 200,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  cameraSubtext: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  cameraActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cameraButton: {
    flex: 1,
  },
  analyzeButton: {
    width: '100%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  errorCard: {
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginVertical: Spacing.md,
  },
  retryButton: {
    minWidth: 120,
  },
  tip: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
});