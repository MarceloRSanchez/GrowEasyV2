import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { ReviewCard } from '@/components/add/ReviewCard';
import { LoadingOverlay } from '@/components/add/LoadingOverlay';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfettiCannon } from '@/components/ui/ConfettiCannon';
import { CancelConfirmDialog } from '@/components/ui/CancelConfirmDialog';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';
import { useAddWizard } from '@/contexts/AddWizardContext';
import { useCreateUserPlant } from '@/hooks/useCreateUserPlant';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft } from 'lucide-react-native';


export default function ReviewPlantScreen() {
  const { selectedPlant, configuration, resetWizard } = useAddWizard();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const createUserPlant = useCreateUserPlant();
  const { toast, showToast, hideToast } = useToast();
  const confettiRef = React.useRef<any>(null);

  // Redirect if no plant selected
  if (!selectedPlant) {
    router.replace('/add/search');
    return null;
  }

  const handleAddToGarden = async () => {
    if (!selectedPlant) return;

    createUserPlant.mutate(
      {
        plantId: selectedPlant.id,
        nickname: configuration.nickname,
        wateringDays: configuration.wateringDays,
        fertilizingDays: configuration.fertilizingDays,
      },
      {
        onSuccess: (data) => {
          // Trigger confetti celebration
          confettiRef.current?.start();
          
          // Show success toast
          showToast('Plant added to your garden! 🌱', 'success');
          
          // Reset wizard state
          resetWizard();
          
          // Navigate to the new plant detail
          setTimeout(() => {
            router.replace(`/plant/${data.userPlantId}`);
          }, 1500); // Delay to show confetti and toast
        },
        onError: (error) => {
          showToast(error.message || 'Failed to add plant. Please try again.', 'error');
        },
      }
    );
  };

  const handleBack = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    resetWizard();
    router.replace('/add/search');
  };

  const handleCancelDismiss = () => {
    setShowCancelDialog(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Review</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Review Card */}
        <ReviewCard
          photoUrl={selectedPlant.imageUrl}
          name={selectedPlant.name}
          scientificName={selectedPlant.scientificName}
          nickname={configuration.nickname}
          wateringDays={configuration.wateringDays}
          fertilizingDays={configuration.fertilizingDays}
        />

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>What happens next?</Text>
          <View style={styles.summaryList}>
            <Text style={styles.summaryItem}>• Your plant will be added to your garden</Text>
            <Text style={styles.summaryItem}>• Care reminders will be scheduled based on your settings</Text>
            <Text style={styles.summaryItem}>• You can track growth and log care activities</Text>
            <Text style={styles.summaryItem}>• Get personalized tips and guidance</Text>
            <Text style={styles.summaryItem}>• Receive notifications when care is due</Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <Button
          title="Add to garden"
          onPress={handleAddToGarden}
          loading={createUserPlant.isLoading}
          disabled={createUserPlant.isLoading}
          size="large"
          style={styles.addButton}
        />
      </View>

      {/* Loading Overlay */}
      <GlobalLoadingOverlay 
        visible={createUserPlant.isLoading} 
        message="Adding to your garden..." 
      />
      
      {/* Confetti Cannon */}
      <ConfettiCannon ref={confettiRef} />
      
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        visible={showCancelDialog}
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelDismiss}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  summaryContainer: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  summaryList: {
    gap: Spacing.sm,
  },
  summaryItem: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addButton: {
    width: '100%',
  },
});