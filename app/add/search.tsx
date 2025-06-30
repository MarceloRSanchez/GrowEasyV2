import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { SearchBar } from '@/components/add/SearchBar';
import { SearchLoadingSkeleton } from '@/components/add/SearchLoadingSkeleton';
import { EmptySearchState } from '@/components/add/EmptySearchState';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';
import { Animated } from 'react-native';
import { CancelConfirmDialog } from '@/components/ui/CancelConfirmDialog';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { useSearchPlants } from '@/hooks/useSearchPlants';
import { useAddWizard } from '@/contexts/AddWizardContext';
import { ArrowLeft } from 'lucide-react-native';

import type { PlantMeta } from '@/hooks/useSearchPlants';

interface PlantListItemProps {
  photoUrl: string;
  name: string;
  scientificName: string;
  category: string;
  difficulty: string;
  onPress: () => void;
}

function PlantListItem({ photoUrl, name, scientificName, category, difficulty, onPress }: PlantListItemProps) {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return Colors.success;
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return Colors.textSecondary;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'herb': return Colors.primary;
      case 'vegetable': return Colors.accent;
      case 'fruit': return '#F59E0B';
      default: return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.plantItem} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: photoUrl }} style={styles.plantImage} />
      <View style={styles.plantInfo}>
        <View style={styles.plantHeader}>
          <Text style={styles.plantName}>{name}</Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: `${getCategoryColor(category)}20` }]}>
              <Text style={[styles.badgeText, { color: getCategoryColor(category) }]}>
                {category}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.scientificName}>{scientificName}</Text>
        <View style={styles.plantFooter}>
          <View style={[styles.difficultyBadge, { backgroundColor: `${getDifficultyColor(difficulty)}20` }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(difficulty) }]}>
              {difficulty}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchPlantScreen() {
  const [query, setQuery] = useState('');
  const [showError, setShowError] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { setSelectedPlant } = useAddWizard();
  const { 
    results, 
    isLoading, 
    error, 
    refetch, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage,
    totalCount 
  } = useSearchPlants(query);

  // Fade in animation when results change
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [results]);

  const handlePlantSelect = (plant: any) => {
    // Convert search result to PlantSelection format
    setSelectedPlant({
      id: plant.id,
      name: plant.name,
      scientificName: plant.scientific_name || '',
      imageUrl: plant.image_url,
      category: plant.category,
      difficulty: plant.difficulty,
      careSchedule: plant.care_schedule || { watering: 2, fertilizing: 14 },
      growthTime: plant.growth_time || 60,
      sunlight: plant.sunlight || 'medium',
      waterNeeds: plant.water_needs || 'medium',
      tips: plant.tips || [],
    });
    
    router.push({
      pathname: '/add/reminders',
    });
  };

  const handleBack = () => {
    // Show confirmation if user has typed a search query
    if (query.trim()) {
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

  const handleRetry = () => {
    setShowError(false);
    refetch();
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderPlantItem = ({ item }: { item: PlantMeta }) => (
    <PlantListItem
      photoUrl={item.image_url}
      name={item.name}
      scientificName={item.scientific_name || ''}
      category={item.category}
      difficulty={item.difficulty}
      onPress={() => handlePlantSelect(item)}
    />
  );

  const renderFooter = () => {
    if (isFetchingNextPage && query) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading more plants...</Text>
        </View>
      );
    }
    return null;
  };

  const renderContent = () => {
    // Show loading skeleton when searching
    if (isLoading && query) {
      return <SearchLoadingSkeleton count={5} />;
    }

    // Show empty state when no results
    if (query && !isLoading && results.length === 0) {
      return <EmptySearchState query={query} onRetry={refetch} />;
    }

    // Show results
    if (results.length > 0) {
      return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <View style={styles.resultsContainer}>
            {/* Indicator of results */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {query 
                  ? `${results.length} plants found${hasNextPage ? '+' : ''}`
                  : 'Popular plants'
                }
              </Text>
              {query && totalCount > 0 && (
                <Text style={styles.resultsHint}>
                  {hasNextPage ? 'Scroll for more results' : 'All results shown'}
                </Text>
              )}
            </View>
            
            <FlatList
              data={results}
              renderItem={renderPlantItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              onEndReached={handleEndReached}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
            />
          </View>
        </Animated.View>
      );
    }

    // Fallback (shouldn't happen with popular plants)
    return (
      <View style={styles.searchPrompt}>
        <Text style={styles.promptTitle}>Search for plants</Text>
        <Text style={styles.promptSubtitle}>
          Start typing to find specific plants
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Search your plant</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Error Toast */}
      {error && showError && (
        <ErrorToast
          message={error}
          onRetry={handleRetry}
          onDismiss={handleDismissError}
        />
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={results.length > 0 && !query 
            ? "Search among all plants..." 
            : "e.g. Basil, Tomato…"
          }
          results={results}
        />
      </View>

      {/* Results List */}
      {renderContent()}

      {/* Global Loading Overlay */}
      <GlobalLoadingOverlay 
        visible={isLoading && !!query} 
        message="Searching plants..." 
      />

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmDialog
        visible={showCancelDialog}
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelDismiss}
        title="Leave search?"
        message="Your search progress will be lost."
        confirmText="Leave"
        cancelText="Stay"
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
  searchContainer: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  listContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.bgLight,
  },
  resultsCount: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  resultsHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  plantItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  plantInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  plantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plantName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  badges: {
    marginLeft: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  scientificName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  plantFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    ...Typography.caption,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  searchPrompt: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  promptTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  promptSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});