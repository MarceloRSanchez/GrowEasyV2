import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CancelConfirmDialog } from '@/components/ui/CancelConfirmDialog';
import { NicknameInput } from '@/components/add/NicknameInput';
import { ReminderPicker } from '@/components/add/ReminderPicker';
import { useAddWizard } from '@/contexts/AddWizardContext';
import { ArrowLeft } from 'lucide-react-native';

// Validation functions
const validateNickname = (nickname: string): string | null => {
  if (!nickname.trim()) {
    return 'Plant nickname is required';
  }
  if (nickname.trim().length < 2) {
    return 'Nickname must be at least 2 characters';
  }
  if (nickname.trim().length > 24) {
    return 'Nickname must be 24 characters or less';
  }
  return null;
};

const validateInterval = (days: number, min: number = 1, max: number = 30): string | null => {
  if (days < min || days > max) {
    return `Must be between ${min} and ${max} days`;
  }
  return null;
};

interface PlantHeaderProps {
  photoUrl: string;
  name: string;
  scientificName: string;
}

function PlantHeader({ photoUrl, name, scientificName }: PlantHeaderProps) {
  return (
    <Card style={styles.plantHeader}>
      <Image source={{ uri: photoUrl }} style={styles.plantImage} />
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{name}</Text>
        <Text style={styles.scientificName}>{scientificName}</Text>
      </View>
    </Card>
  );
}

export default function ConfigureRemindersScreen() {
  const { selectedPlant, configuration, updateConfiguration } = useAddWizard();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [errors, setErrors] = useState<{
    nickname?: string;
    watering?: string;
    fertilizing?: string;
  }>({});

  useEffect(() => {
    if (!selectedPlant) {
      router.replace('/add/search');
    }
  }, [selectedPlant]);
  // Redirect if no plant selected
  if (!selectedPlant) {
    return null;
  }

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const nicknameError = validateNickname(configuration.nickname);
    if (nicknameError) newErrors.nickname = nicknameError;
    
    const wateringError = validateInterval(configuration.wateringDays, 1, 30);
    if (wateringError) newErrors.watering = wateringError;
    
    const fertilizingError = validateInterval(configuration.fertilizingDays, 1, 30);
    if (fertilizingError) newErrors.fertilizing = fertilizingError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNicknameChange = (nickname: string) => {
    updateConfiguration({ nickname });
    // Clear nickname error on change
    if (errors.nickname) {
      setErrors(prev => ({ ...prev, nickname: undefined }));
    }
  };

  const handleWateringChange = (wateringDays: number) => {
    updateConfiguration({ wateringDays });
    // Clear watering error on change
    if (errors.watering) {
      setErrors(prev => ({ ...prev, watering: undefined }));
    }
  };

  const handleFertilizingChange = (fertilizingDays: number) => {
    updateConfiguration({ fertilizingDays });
    // Clear fertilizing error on change
    if (errors.fertilizing) {
      setErrors(prev => ({ ...prev, fertilizing: undefined }));
    }
  };

  const handleNext = () => {
    if (!validateForm()) {
      return;
    }

    router.push('/add/review');
  };

  const handleBack = () => {
    // Show confirmation if user has made changes
    const hasChanges = configuration.nickname !== selectedPlant?.name ||
                      configuration.wateringDays !== (selectedPlant?.careSchedule.watering || 2) ||
                      configuration.fertilizingDays !== (selectedPlant?.careSchedule.fertilizing || 14);
    
    if (hasChanges) {
      setShowCancelDialog(true);
    } else {
      router.back();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelDialog(false);
    router.back();
  };

  const handleCancelDismiss = () => {
    setShowCancelDialog(false);
  };

  const isFormValid = !errors.nickname && !errors.watering && !errors.fertilizing && 
                     configuration.nickname.trim().length >= 2;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Configure care</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plant Header */}
        <PlantHeader
          photoUrl={selectedPlant.imageUrl}
          name={selectedPlant.name}
          scientificName={selectedPlant.scientificName}
        />

        {/* Configuration Form */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>Plant Details</Text>
          
          <NicknameInput
            value={configuration.nickname}
            onChange={handleNicknameChange}
            error={errors.nickname}
            autoFocus
          />

          <Text style={styles.sectionTitle}>Care Schedule</Text>
          
          <ReminderPicker
            label="Water every"
            value={configuration.wateringDays}
            onChange={handleWateringChange}
            unit="days"
            min={1}
            max={30}
            error={errors.watering}
          />

          <ReminderPicker
            label="Fertilize every"
            value={configuration.fertilizingDays}
            onChange={handleFertilizingChange}
            unit="days"
            min={1}
            max={30}
            error={errors.fertilizing}
          />
        </Card>

        {/* Tips Card */}
        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Care Tips</Text>
          <Text style={styles.tipsText}>
            These schedules are based on {selectedPlant.name} care requirements. 
            Adjust them based on your environment, season, and plant's response.
          </Text>
          {selectedPlant.tips.length > 0 && (
            <View style={styles.plantTips}>
              <Text style={styles.plantTipsTitle}>Plant-specific tips:</Text>
              {selectedPlant.tips.slice(0, 2).map((tip, index) => (
                <Text key={index} style={styles.plantTip}>• {tip}</Text>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <Button
          title="Next"
          onPress={handleNext}
          disabled={!isFormValid}
          size="large"
          style={styles.nextButton}
        />
      </View>

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        visible={showCancelDialog}
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelDismiss}
      />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  keyboardView: {
    flex: 1,
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
  plantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  scientificName: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  formCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  tipsCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#F0F9FF',
  },
  tipsTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  tipsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  plantTips: {
    marginTop: Spacing.sm,
  },
  plantTipsTitle: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  plantTip: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 2,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    width: '100%',
  },
});