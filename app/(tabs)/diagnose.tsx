import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, Image as ImageIcon, Scan, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Circle as XCircle, Lightbulb } from 'lucide-react-native';

interface DiagnosisHistory {
  id: string;
  imageUrl: string;
  plantName: string;
  result: 'healthy' | 'warning' | 'critical';
  issues: string[];
  date: string;
}

const mockDiagnosisHistory: DiagnosisHistory[] = [
  {
    id: '1',
    imageUrl: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    plantName: 'Basil Plant',
    result: 'healthy',
    issues: [],
    date: '2024-01-20',
  },
  {
    id: '2',
    imageUrl: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800',
    plantName: 'Tomato Plant',
    result: 'warning',
    issues: ['Overwatering', 'Nutrient deficiency'],
    date: '2024-01-19',
  },
  {
    id: '3',
    imageUrl: 'https://images.pexels.com/photos/568470/pexels-photo-568470.jpeg?auto=compress&cs=tinysrgb&w=800',
    plantName: 'Mint Plant',
    result: 'critical',
    issues: ['Fungal infection', 'Root rot'],
    date: '2024-01-18',
  },
];

export default function DiagnoseScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleTakePhoto = () => {
    Alert.alert(
      'Camera Access',
      'Camera functionality is not available in web preview. In a real app, this would open the camera.',
      [{ text: 'OK' }]
    );
  };

  const handleSelectFromGallery = () => {
    Alert.alert(
      'Gallery Access',
      'Gallery functionality is not available in web preview. In a real app, this would open the photo gallery.',
      [{ text: 'OK' }]
    );
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    timeoutRef.current = setTimeout(() => {
      setIsAnalyzing(false);
      Alert.alert(
        'Analysis Complete',
        'Your plant appears healthy! No issues detected.',
        [{ text: 'View Details' }]
      );
      timeoutRef.current = null;
    }, 3000);
  };

  const getStatusIcon = (result: string) => {
    switch (result) {
      case 'healthy':
        return <CheckCircle size={20} color={Colors.success} />;
      case 'warning':
        return <AlertTriangle size={20} color={Colors.warning} />;
      case 'critical':
        return <XCircle size={20} color={Colors.error} />;
      default:
        return null;
    }
  };

  const getStatusColor = (result: string) => {
    switch (result) {
      case 'healthy':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'critical':
        return Colors.error;
      default:
        return Colors.textMuted;
    }
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
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
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
            />
            <Button
              title="From Gallery"
              onPress={handleSelectFromGallery}
              variant="outline"
              style={styles.cameraButton}
            />
          </View>

          {selectedImage && (
            <Button
              title="Analyze Plant"
              onPress={handleAnalyze}
              loading={isAnalyzing}
              style={styles.analyzeButton}
            />
          )}
        </Card>

        {/* AI Tips */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Lightbulb size={24} color={Colors.warning} />
            <Text style={styles.tipsTitle}>Photography Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>• Use natural lighting when possible</Text>
            <Text style={styles.tip}>• Focus on the affected leaves or areas</Text>
            <Text style={styles.tip}>• Keep the camera steady and close</Text>
            <Text style={styles.tip}>• Include surrounding healthy parts for comparison</Text>
          </View>
        </Card>

        {/* Recent Diagnoses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Diagnoses</Text>
          {mockDiagnosisHistory.map((diagnosis) => (
            <TouchableOpacity key={diagnosis.id}>
              <Card style={styles.historyCard}>
                <View style={styles.historyContent}>
                  <Image
                    source={{ uri: diagnosis.imageUrl }}
                    style={styles.historyImage}
                  />
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyPlantName}>{diagnosis.plantName}</Text>
                    <View style={styles.historyStatus}>
                      {getStatusIcon(diagnosis.result)}
                      <Text
                        style={[
                          styles.historyResult,
                          { color: getStatusColor(diagnosis.result) },
                        ]}
                      >
                        {diagnosis.result.charAt(0).toUpperCase() + diagnosis.result.slice(1)}
                      </Text>
                    </View>
                    {diagnosis.issues.length > 0 && (
                      <Text style={styles.historyIssues}>
                        {diagnosis.issues.join(', ')}
                      </Text>
                    )}
                    <Text style={styles.historyDate}>{diagnosis.date}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
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
  tipsCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#FFF9E6',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  tipsList: {
    gap: Spacing.xs,
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
  historyCard: {
    marginBottom: Spacing.md,
  },
  historyContent: {
    flexDirection: 'row',
  },
  historyImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    resizeMode: 'cover',
    marginRight: Spacing.md,
  },
  historyInfo: {
    flex: 1,
  },
  historyPlantName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyResult: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginLeft: 4,
  },
  historyIssues: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  historyDate: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});