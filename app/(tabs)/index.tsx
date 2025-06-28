import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { PlantPickerSheet } from '@/components/home/PlantPickerSheet';
import { EcoScoreCard } from '@/components/home/EcoScoreCard';
import { QuickActionBtn, IconName } from '@/components/home/QuickActionBtn';
import { PlantCard } from '@/components/home/PlantCard';
import { TodayCareCard } from '@/components/home/TodayCareCard';
import { EmptyGardenState } from '@/components/home/EmptyGardenState';
import { HomeLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { Toast } from '@/components/ui/Toast';
import { QuickActionSheet, QuickActionSheetRef } from '@/components/quickActions/QuickActionSheet';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { Calendar } from 'lucide-react-native';
import { useLogWatering } from '@/hooks/useLogWatering';
import { useLogFertilizing } from '@/hooks/useLogFertilizing';
import { ConfettiCannon } from '@/components/ui/ConfettiCannon';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useHomeSnapshot(user?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showError, setShowError] = useState(true);
  const [showWaterPicker, setShowWaterPicker] = useState(false);
  const [showFertilizePicker, setShowFertilizePicker] = useState(false);
  const quickActionSheetRef = React.useRef<QuickActionSheetRef>(null);
  const plantPickerRef = React.useRef<BottomSheetModal>(null);
  const fertilizePickerRef = React.useRef<BottomSheetModal>(null);
  const { toast, showToast, hideToast } = useToast();
  const confettiRef = React.useRef<any>(null);
  const logWatering = useLogWatering();
  const logFertilizing = useLogFertilizing();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleQuickAction = (action: IconName) => {
    switch (action) {
      case 'add':
        router.push('/add-plant');
        break;
      case 'water':
        setShowWaterPicker(true);
        plantPickerRef.current?.present();
        break;
      case 'fertilize':
        setShowFertilizePicker(true);
        fertilizePickerRef.current?.present();
        break;
    }
  };

  const handleWaterConfirm = (userPlantId: string) => {
    logWatering.mutate(
      { userPlantId },
      {
        onSuccess: () => {
          // Trigger confetti
          confettiRef.current?.start();
          
          // Show success toast
          showToast('Watered! 💧', 'success');
          
          // Close the picker after a delay
          setTimeout(() => {
            plantPickerRef.current?.close();
          }, 1000);
        },
        onError: () => {
          showToast('Error watering plant', 'error');
        }
      }
    );
  };

  const handleFertilizeConfirm = (userPlantId: string) => {
    logFertilizing.mutate(
      { userPlantId },
      {
        onSuccess: () => {
          // Trigger confetti
          confettiRef.current?.start();
          
          // Show success toast
          showToast('Fertilized! 🌱', 'success');
          
          // Close the picker after a delay
          setTimeout(() => {
            fertilizePickerRef.current?.close();
          }, 1000);
        },
        onError: () => {
          showToast('Error fertilizing plant', 'error');
        }
      }
    );
  };

  const handlePlantPress = (plantId: string) => {
    router.push(`/plant/${plantId}`);
  };

  const handleQuickActionEdit = (plant: any) => {
    quickActionSheetRef.current?.open({
      id: plant.id,
      nickname: plant.name,
      photoUrl: plant.photoUrl,
      growthPercent: plant.progressPct,
      species: plant.species,
    });
  };

  const handleTodayCareDone = () => {
    Alert.alert(t('home.todayCare.allDone'), t('home.todayCare.allDoneMessage'));
  };

  const handleAddPlant = () => {
    router.push('/add-plant');
  };

  const handleCalendarPress = () => {
    router.push('/calendar');
  };

  const handleRetry = () => {
    setShowError(false);
    refetch();
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  // Show loading skeleton while fetching data
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeLoadingSkeleton />
      </SafeAreaView>
    );
  }

  // Show empty state if no plants
  if (data && data.plants.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.calendarButton} onPress={handleCalendarPress}>
            <Calendar size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {error && showError && (
          <ErrorToast
            message={error}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />
        )}
        <EmptyGardenState onAddPlant={handleAddPlant} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* App Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{t('home.greeting')}</Text>
            <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          </View>
          <TouchableOpacity style={styles.calendarButton} onPress={handleCalendarPress}>
            <Calendar size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Error Toast */}
        {error && showError && (
          <ErrorToast
            message={error}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
          />
        )}

        {data && (
          <>
            {/* Eco Score Card */}
            <EcoScoreCard
              score={data.ecoScore}
              deltaWeek={data.deltaWeek}
              streakDays={data.streakDays}
              litersSaved={data.litersSaved}
              variant="menta" //lima, menta, coral
            />

            {/* Quick Actions Row */}
            <View style={styles.quickActionsContainer}>
              <QuickActionBtn
                icon="add"
                label={t('home.addPlant')}
                onPress={() => handleQuickAction('add')}
              />
              <QuickActionBtn
                icon="water"
                label={t('home.waterLog')}
                onPress={() => handleQuickAction('water')} 
              />
              <QuickActionBtn
                icon="fertilize"
                label={t('home.fertilizeLog')}
                onPress={() => handleQuickAction('fertilize')}
              />
            </View>

            {/* Today's Care */}
            {data.todayCare && (
              <TodayCareCard
                taskLabel={data.todayCare.taskLabel}
                plants={data.todayCare.plants}
                onPressDone={handleTodayCareDone}
              />
            )}

            {/* My Plants List */}
            {data.plants.length > 0 && (
              <View style={styles.plantsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{t('home.myPlants')}</Text>
                  <TouchableOpacity onPress={() => router.push('/plants')}>
                    <Text style={styles.seeAllText}>{t('home.seeAll')}</Text>
                  </TouchableOpacity>
                </View>

                {data.plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    id={plant.id}
                    photoUrl={plant.photoUrl}
                    name={plant.name}
                    species={plant.species || 'Unknown species'}
                    progressPct={plant.progressPct}
                    nextActionLabel={plant.nextActionLabel}
                    nextActionColor={plant.nextActionColor}
                    onPress={() => handlePlantPress(plant.id)}
                    onQuickAction={() => handleQuickActionEdit(plant)}
                    showToast={showToast}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* Quick Action Sheet */}
      <QuickActionSheet
        ref={quickActionSheetRef}
      />
      
      {/* Plant Picker Sheet for Water Log */}
      <PlantPickerSheet
        bottomSheetRef={plantPickerRef}
        onConfirm={handleWaterConfirm}
        actionType="water"
      />
      
      {/* Plant Picker Sheet for Fertilize Log */}
      <PlantPickerSheet
        bottomSheetRef={fertilizePickerRef}
        onConfirm={handleFertilizeConfirm}
        actionType="fertilize"
      />

      {/* Global Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
      
      {/* Confetti Cannon */}
      <ConfettiCannon ref={confettiRef} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  calendarButton: {
    width: 48,
    height: 48,
    backgroundColor: Colors.white,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  plantsSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  seeAllText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
});