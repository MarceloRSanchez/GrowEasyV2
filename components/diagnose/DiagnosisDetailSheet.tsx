import React, { useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { DiagnosisItem } from '@/hooks/useUserDiagnoses';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { formatDistanceToNow } from 'date-fns';

interface DiagnosisDetailSheetProps {
  diagnosis: DiagnosisItem | null;
  isVisible: boolean;
  onClose: () => void;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

export function DiagnosisDetailSheet({ 
  diagnosis, 
  isVisible, 
  onClose,
  bottomSheetRef
}: DiagnosisDetailSheetProps) {
  const snapPoints = ['80%'];
  
  const getStatusIcon = () => {
    if (!diagnosis) return null;
    
    switch (diagnosis.status) {
      case 'healthy':
        return <CheckCircle size={24} color={Colors.success} />;
      case 'warning':
        return <AlertTriangle size={24} color={Colors.warning} />;
      case 'critical':
        return <XCircle size={24} color={Colors.error} />;
      default:
        return null;
    }
  };
  
  const getStatusColor = () => {
    if (!diagnosis) return Colors.textMuted;
    
    switch (diagnosis.status) {
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
  
  // Present the sheet when isVisible changes
  React.useEffect(() => {
    if (isVisible && diagnosis) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isVisible, diagnosis, bottomSheetRef]);
  
  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);
  
  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );
  
  if (!diagnosis) return null;
  
  const timeAgo = formatDistanceToNow(new Date(diagnosis.created_at), { addSuffix: true });
  
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            {getStatusIcon()}
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {diagnosis.status.charAt(0).toUpperCase() + diagnosis.status.slice(1)}
            </Text>
          </View>
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <Image 
            source={{ uri: diagnosis.image_url }} 
            style={styles.image}
            accessibilityLabel="Plant diagnosis full image"
          />
          
          {/* Resume */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.resume}>{diagnosis.resume}</Text>
            <Text style={styles.date}>{timeAgo}</Text>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Analysis</Text>
            <Text style={styles.description}>{diagnosis.description}</Text>
          </View>
          
          {/* Recommendations based on status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {diagnosis.status === 'healthy' && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Continue with your current care routine
                </Text>
                <Text style={styles.recommendationText}>
                  • Monitor for any changes in leaf color or growth
                </Text>
                <Text style={styles.recommendationText}>
                  • Consider taking regular photos to track progress
                </Text>
              </View>
            )}
            
            {diagnosis.status === 'warning' && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Adjust watering schedule based on the analysis
                </Text>
                <Text style={styles.recommendationText}>
                  • Check light conditions and adjust if needed
                </Text>
                <Text style={styles.recommendationText}>
                  • Monitor closely over the next few days
                </Text>
              </View>
            )}
            
            {diagnosis.status === 'critical' && (
              <View style={styles.recommendationItem}>
                <Text style={styles.recommendationText}>
                  • Take immediate action based on the diagnosis
                </Text>
                <Text style={styles.recommendationText}>
                  • Consider repotting or changing soil if root issues are suspected
                </Text>
                <Text style={styles.recommendationText}>
                  • Isolate from other plants if disease is detected
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  status: {
    ...Typography.h3,
    marginLeft: Spacing.xs,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  section: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  resume: {
    ...Typography.body,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    lineHeight: 24,
  },
  date: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  description: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  recommendationItem: {
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
});