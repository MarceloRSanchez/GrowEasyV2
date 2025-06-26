import React, { forwardRef, useImperativeHandle, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { ActionButton } from './ActionButton';
import { ArchiveButton } from './ArchiveButton';
import { ErrorBanner } from './ErrorBanner';
import { LoadingOverlay } from './LoadingOverlay';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ConfettiCannon, ConfettiCannonRef } from '@/components/ui/ConfettiCannon';
import { Toast } from '@/components/ui/Toast';
import { useLogWatering } from '@/hooks/useLogWatering';
import { useLogFertilizing } from '@/hooks/useLogFertilizing';
import { useLogHarvest } from '@/hooks/useLogHarvest';
import { useArchivePlant } from '@/hooks/useArchivePlant';
import { useToast } from '@/hooks/useToast';
import { X } from 'lucide-react-native';

export interface QuickActionSheetRef {
  open: (plantData: PlantData) => void;
  close: () => void;
}

interface PlantData {
  id: string;
  nickname: string;
  photoUrl: string;
  growthPercent: number;
  species?: string;
}

interface QuickActionSheetProps {
  onWater?: (plantId: string) => void;
  onFertilize?: (plantId: string) => void;
  onHarvest?: (plantId: string) => void;
  onArchive?: (plantId: string) => void;
}

export const QuickActionSheet = forwardRef<QuickActionSheetRef, QuickActionSheetProps>(
  ({ onWater, onFertilize, onHarvest, onArchive }, ref) => {
    const [currentPlant, setCurrentPlant] = React.useState<PlantData | null>(null);
    const [loadingAction, setLoadingAction] = React.useState<string | null>(null);
    const [errorCount, setErrorCount] = React.useState<Record<string, number>>({});
    const [showErrorBanner, setShowErrorBanner] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string>('');
    const bottomSheetRef = React.useRef<BottomSheet>(null);
    const confettiRef = useRef<ConfettiCannonRef>(null);

    // Hooks for mutations
    const logWatering = useLogWatering();
    const logFertilizing = useLogFertilizing();
    const logHarvest = useLogHarvest();
    const archivePlant = useArchivePlant();
    const { toast, showToast, hideToast } = useToast();

    // Bottom sheet snap points (40% of screen height)
    const snapPoints = useMemo(() => ['40%'], []);

    useImperativeHandle(ref, () => ({
      open: (plantData: PlantData) => {
        setCurrentPlant(plantData);
        setLoadingAction(null);
        setErrorCount({});
        setShowErrorBanner(false);
        setErrorMessage('');
        bottomSheetRef.current?.expand();
      },
      close: () => {
        bottomSheetRef.current?.close();
      },
    }));

    const handleSheetChanges = useCallback((index: number) => {
      if (index === -1) {
        // Sheet is closed
        setCurrentPlant(null);
        setLoadingAction(null);
        setErrorCount({});
        setShowErrorBanner(false);
        setErrorMessage('');
      }
    }, []);

    const handleClose = () => {
      bottomSheetRef.current?.close();
    };

    const handleError = (actionType: string, error: any) => {
      const newErrorCount = { ...errorCount };
      newErrorCount[actionType] = (newErrorCount[actionType] || 0) + 1;
      setErrorCount(newErrorCount);

      // Show error banner if this action has failed 2+ times
      if (newErrorCount[actionType] >= 2) {
        setShowErrorBanner(true);
        setErrorMessage('Multiple failures detected. Try again later or check your connection.');
      } else {
        // Show regular toast for first failure
        showToast('Something went wrong. Try again?', 'error');
      }
      
      console.error(`${actionType} failed:`, error);
    };

    const handleRetryFromBanner = () => {
      setShowErrorBanner(false);
      setErrorMessage('');
      setErrorCount({});
    };

    const handleDismissErrorBanner = () => {
      setShowErrorBanner(false);
    };

    const handleWater = () => {
      if (!currentPlant) return;
      
      setLoadingAction('water');
      
      logWatering.mutate(
        { userPlantId: currentPlant.id },
        {
          onSuccess: () => {
            // Trigger confetti
            confettiRef.current?.start();
            
            // Show success toast
            showToast('Well watered! 💧', 'success');
            
            // Fire analytics event
            console.log('Analytics: quick_action_done', { 
              plantId: currentPlant.id, 
              actionType: 'water' 
            });
            
            // Call optional callback
            onWater?.(currentPlant.id);
            
            // Auto-close sheet after delay
            setTimeout(() => {
              handleClose();
            }, 1500);
          },
          onError: (error) => {
            handleError('water', error);
          },
          onSettled: () => {
            setLoadingAction(null);
          },
        }
      );
    };

    const handleFertilize = () => {
      if (!currentPlant) return;
      
      setLoadingAction('fertilize');
      
      logFertilizing.mutate(
        { userPlantId: currentPlant.id },
        {
          onSuccess: () => {
            // Trigger confetti
            confettiRef.current?.start();
            
            // Show success toast
            showToast('Plant fertilized! 🌱', 'success');
            
            // Fire analytics event
            console.log('Analytics: quick_action_done', { 
              plantId: currentPlant.id, 
              actionType: 'fertilize' 
            });
            
            // Call optional callback
            onFertilize?.(currentPlant.id);
            
            // Auto-close sheet after delay
            setTimeout(() => {
              handleClose();
            }, 1500);
          },
          onError: (error) => {
            handleError('fertilize', error);
          },
          onSettled: () => {
            setLoadingAction(null);
          },
        }
      );
    };

    const handleHarvest = () => {
      if (!currentPlant) return;
      
      setLoadingAction('harvest');
      
      logHarvest.mutate(
        { userPlantId: currentPlant.id },
        {
          onSuccess: () => {
            // Trigger confetti
            confettiRef.current?.start();
            
            // Show success toast
            showToast('Harvest complete! 🎉', 'success');
            
            // Fire analytics event
            console.log('Analytics: quick_action_done', { 
              plantId: currentPlant.id, 
              actionType: 'harvest' 
            });
            
            // Call optional callback
            onHarvest?.(currentPlant.id);
            
            // Auto-close sheet after delay
            setTimeout(() => {
              handleClose();
            }, 1500);
          },
          onError: (error) => {
            handleError('harvest', error);
          },
          onSettled: () => {
            setLoadingAction(null);
          },
        }
      );
    };

    const handleArchive = () => {
      if (!currentPlant) return;
      
      Alert.alert(
        'Archive plant?',
        'It will disappear from your garden.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            style: 'destructive',
            onPress: () => {
              setLoadingAction('archive');
              
              archivePlant.mutate(
                { userPlantId: currentPlant.id },
                {
                  onSuccess: () => {
                    // Show success toast
                    showToast('Plant archived! 📦', 'success');
                    
                    // Fire analytics event
                    console.log('Analytics: quick_action_archive', { 
                      plantId: currentPlant.id 
                    });
                    
                    // Call optional callback
                    onArchive?.(currentPlant.id);
                    
                    // Close sheet immediately
                    handleClose();
                  },
                  onError: (error) => {
                    handleError('archive', error);
                  },
                  onSettled: () => {
                    setLoadingAction(null);
                  },
                }
              );
            },
          },
        ]
      );
    };

    // Check if any mutation is loading for global loading overlay
    const isGlobalLoading = !!loadingAction;

    if (!currentPlant) {
      return (
        <>
          <ConfettiCannon ref={confettiRef} />
          <Toast
            message={toast.message}
            type={toast.type}
            visible={toast.visible}
            onHide={hideToast}
          />
        </>
      );
    }

    return (
      <>
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          enablePanDownToClose
          backgroundStyle={styles.bottomSheetBackground}
          handleIndicatorStyle={styles.handleIndicator}
        >
          <BottomSheetView style={styles.contentContainer}>
            {/* Error Banner */}
            {showErrorBanner && (
              <ErrorBanner
                message={errorMessage}
                onRetry={handleRetryFromBanner}
                onDismiss={handleDismissErrorBanner}
              />
            )}

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.plantInfo}>
                <Image source={{ uri: currentPlant.photoUrl }} style={styles.plantPhoto} />
                <View style={styles.plantDetails}>
                  <Text style={styles.plantNickname}>{currentPlant.nickname}</Text>
                  {currentPlant.species && (
                    <Text style={styles.plantSpecies}>{currentPlant.species}</Text>
                  )}
                  <View style={styles.progressContainer}>
                    <ProgressBar progress={currentPlant.growthPercent} height={4} />
                    <Text style={styles.progressText}>{currentPlant.growthPercent}% grown</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X size={24} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              <ActionButton 
                type="water" 
                onPress={handleWater}
                disabled={isGlobalLoading}
                loading={loadingAction === 'water'}
              />
              <ActionButton 
                type="fertilize" 
                onPress={handleFertilize}
                disabled={isGlobalLoading}
                loading={loadingAction === 'fertilize'}
              />
              <ActionButton 
                type="harvest" 
                onPress={handleHarvest}
                disabled={isGlobalLoading}
                loading={loadingAction === 'harvest'}
              />
            </View>

            {/* Secondary Actions */}
            <View style={styles.secondaryActions}>
              <ArchiveButton 
                onArchive={handleArchive}
                disabled={isGlobalLoading}
                loading={loadingAction === 'archive'}
              />
            </View>

            {/* Global Loading Overlay */}
            <LoadingOverlay visible={isGlobalLoading} />
          </BottomSheetView>
        </BottomSheet>

        {/* Confetti Cannon */}
        <ConfettiCannon ref={confettiRef} />
        
        {/* Toast */}
        <Toast
          message={toast.message}
          type={toast.type}
          visible={toast.visible}
          onHide={hideToast}
        />
      </>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleIndicator: {
    backgroundColor: Colors.border,
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  plantPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  plantDetails: {
    flex: 1,
  },
  plantNickname: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  plantSpecies: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  secondaryActions: {
    alignItems: 'center',
  },
});

QuickActionSheet.displayName = 'QuickActionSheet';