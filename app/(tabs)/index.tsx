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
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { EcoScoreCard } from '@/components/home/EcoScoreCard';
import { QuickActionBtn, IconName } from '@/components/home/QuickActionBtn';
import { PlantCard } from '@/components/home/PlantCard';
import { TodayCareCard } from '@/components/home/TodayCareCard';
import { EmptyGardenState } from '@/components/home/EmptyGardenState';
import { HomeLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { QuickActionSheet, QuickActionSheetRef } from '@/components/quickActions/QuickActionSheet';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { Calendar } from 'lucide-react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useHomeSnapshot(user?.id);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showError, setShowError] = useState(true);
  const quickActionSheetRef = React.useRef<QuickActionSheetRef>(null);

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
        Alert.alert('Water Log', 'Water logging feature coming soon!');
        break;
      case 'light':
        Alert.alert('Light Check', 'Light measurement feature coming soon!');
        break;
    }
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

  const handleQuickWater = (plantId: string) => {
    // Action is handled by the QuickActionSheet with real mutations
    console.log('Quick water completed for plant:', plantId);
  };

  const handleQuickFertilize = (plantId: string) => {
    // Action is handled by the QuickActionSheet with real mutations
    console.log('Quick fertilize completed for plant:', plantId);
  };

  const handleQuickHarvest = (plantId: string) => {
    // Action is handled by the QuickActionSheet with real mutations
    console.log('Quick harvest completed for plant:', plantId);
  };

  const handleQuickArchive = (plantId: string) => {
    // Action is handled by the QuickActionSheet with real mutations
    console.log('Quick archive completed for plant:', plantId);
  };

  const handleTodayCareDone = () => {
    Alert.alert('Great job!', 'All care tasks completed for today! 🌱');
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
            <Text style={styles.greeting}>Good morning! 🌱</Text>
            <Text style={styles.subtitle}>Ready to grow today?</Text>
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
            <Text style={styles.greeting}>Good morning! 🌱</Text>
            <Text style={styles.subtitle}>Ready to grow today?</Text>
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
            />

            {/* Quick Actions Row */}
            <View style={styles.quickActionsContainer}>
              <QuickActionBtn
                icon="add"
                label="Add Plant"
                onPress={() => handleQuickAction('add')}
              />
              <QuickActionBtn
                icon="water"
                label="Water Log"
                onPress={() => handleQuickAction('water')}
              />
              <QuickActionBtn
                icon="light"
                label="Light Check"
                onPress={() => handleQuickAction('light')}
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
                  <Text style={styles.sectionTitle}>My Plants</Text>
                  <TouchableOpacity onPress={() => router.push('/plants')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </TouchableOpacity>
                </View>

                {data.plants.map((plant) => (
                  <PlantCard
                    key={plant.id}
                    photoUrl={plant.photoUrl}
                    name={plant.name}
                    species={plant.species || 'Unknown species'}
                    progressPct={plant.progressPct}
                    nextActionLabel={plant.nextActionLabel}
                    nextActionColor={plant.nextActionColor}
                    onPress={() => handlePlantPress(plant.id)}
                    onQuickAction={() => handleQuickActionEdit(plant)}
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
        onWater={handleQuickWater}
        onFertilize={handleQuickFertilize}
        onHarvest={handleQuickHarvest}
        onArchive={handleQuickArchive}
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