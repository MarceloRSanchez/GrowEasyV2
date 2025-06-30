import React, { useState, useMemo, useCallback } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  RefreshControl, 
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { PlantCard } from '@/components/home/PlantCard';
import { EmptyGardenState } from '@/components/home/EmptyGardenState';
import { HomeLoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorToast } from '@/components/ui/ErrorToast';
import { Toast } from '@/components/ui/Toast';
import { ConfettiCannon } from '@/components/ui/ConfettiCannon';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ArrowLeft, Search, Filter, Import as SortAsc, Dessert as SortDesc, Droplets, Zap, Scissors, Clock, Plus } from 'lucide-react-native';

type SortOption = 'name' | 'progress' | 'nextAction' | 'dateAdded';
type FilterOption = 'all' | 'needsWater' | 'needsFertilizer' | 'readyHarvest';

interface PlantData {
  id: string;
  name: string;
  photoUrl: string;
  species?: string;
  progressPct: number;
  nextActionLabel: string;
  nextActionColor: string;
  createdAt?: string;
}

export default function AllPlantsScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useHomeSnapshot(user?.id);
  const { toast, showToast, hideToast } = useToast();
  const confettiRef = React.useRef<any>(null);
  
  // State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showError, setShowError] = useState(true);
  
  // Filter options
  const filterOptions = [
    {
      key: 'all' as FilterOption,
      label: t('plants.filters.all', 'All'),
      icon: null,
    },
    {
      key: 'needsWater' as FilterOption,
      label: t('plants.filters.needsWater', 'Needs Water'),
      icon: <Droplets size={16} color={Colors.primary} />,
    },
    {
      key: 'needsFertilizer' as FilterOption,
      label: t('plants.filters.needsFertilizer', 'Needs Fertilizer'),
      icon: <Zap size={16} color={Colors.secondary} />,
    },
    {
      key: 'readyHarvest' as FilterOption,
      label: t('plants.filters.readyHarvest', 'Ready to Harvest'),
      icon: <Scissors size={16} color={Colors.warning} />,
    },
  ];
  
  // Sort options
  const sortOptions = [
    { key: 'name' as SortOption, label: 'Name' },
    { key: 'progress' as SortOption, label: 'Growth Progress' },
    { key: 'nextAction' as SortOption, label: 'Next Action' },
    { key: 'dateAdded' as SortOption, label: 'Date Added' },
  ];
  
  // Toggle sort order
  const toggleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // Change sort by
  const changeSortBy = (option: SortOption) => {
    if (sortBy === option) {
      toggleSort();
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };
  
  // Handle retry
  const handleRetry = () => {
    setShowError(false);
    refetch();
  };
  
  // Handle dismiss error
  const handleDismissError = () => {
    setShowError(false);
  };
  
  // Filter and sort plants
  const filteredAndSortedPlants = useMemo(() => {
    if (!data?.plants) return [];
    
    let filtered = [...data.plants];
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plant => 
        plant.name.toLowerCase().includes(query) ||
        (plant.species && plant.species.toLowerCase().includes(query))
      );
    }
    
    // Status filter
    switch (activeFilter) {
      case 'needsWater':
        filtered = filtered.filter(p => p.nextActionLabel.toLowerCase().includes('water'));
        break;
      case 'needsFertilizer':
        filtered = filtered.filter(p => p.nextActionLabel.toLowerCase().includes('fertilize'));
        break;
      case 'readyHarvest':
        filtered = filtered.filter(p => p.nextActionLabel.toLowerCase().includes('harvest'));
        break;
      default:
        break;
    }
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'progress':
          comparison = a.progressPct - b.progressPct;
          break;
        case 'nextAction':
          comparison = a.nextActionLabel.localeCompare(b.nextActionLabel);
          break;
        case 'dateAdded':
          // Fallback to name if createdAt is not available
          comparison = (a.createdAt && b.createdAt) 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : a.name.localeCompare(b.name);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  }, [data?.plants, searchQuery, activeFilter, sortBy, sortOrder]);
  
  // Empty search results component
  const EmptySearchResults = useCallback(({ query }: { query: string }) => (
    <View style={styles.emptySearch}>
      <Search size={48} color={Colors.textMuted} />
      <Text style={styles.emptySearchTitle}>No plants found</Text>
      <Text style={styles.emptySearchSubtitle}>
        No plants match "{query}". Try a different search term.
      </Text>
    </View>
  ), []);
  
  // Show loading skeleton while fetching data
  if (loading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <HomeLoadingSkeleton />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('plants.title', 'My Plants')}</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => router.push('/add-plant')}
          accessibilityLabel="Add plant"
          accessibilityRole="button"
        >
          <Plus size={24} color={Colors.white} />
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
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('plants.searchPlaceholder', 'Search your plants...')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.textSecondary}
            accessibilityLabel="Search plants"
            accessibilityHint="Type to search your plants by name or species"
          />
        </View>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersScroll}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterChip,
                activeFilter === filter.key && styles.filterChipActive
              ]}
              onPress={() => setActiveFilter(filter.key)}
              accessibilityLabel={filter.label}
              accessibilityRole="button"
              accessibilityState={{ selected: activeFilter === filter.key }}
            >
              {filter.icon}
              <Text style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={toggleSort}
          accessibilityLabel={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          accessibilityRole="button"
        >
          {sortOrder === 'asc' ? 
            <SortAsc size={20} color={Colors.textPrimary} /> : 
            <SortDesc size={20} color={Colors.textPrimary} />
          }
        </TouchableOpacity>
      </View>
      
      {/* Sort Options */}
      <View style={styles.sortOptionsContainer}>
        <Text style={styles.sortByText}>Sort by:</Text>
        <View style={styles.sortOptions}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sortOption,
                sortBy === option.key && styles.sortOptionActive
              ]}
              onPress={() => changeSortBy(option.key)}
              accessibilityLabel={`Sort by ${option.label}`}
              accessibilityRole="button"
              accessibilityState={{ selected: sortBy === option.key }}
            >
              <Text style={[
                styles.sortOptionText,
                sortBy === option.key && styles.sortOptionTextActive
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Plant List */}
      <FlatList
        data={filteredAndSortedPlants}
        renderItem={({ item }) => (
          <PlantCard
            id={item.id}
            photoUrl={item.photoUrl}
            name={item.name}
            species={item.species || 'Unknown species'}
            progressPct={item.progressPct}
            nextActionLabel={item.nextActionLabel}
            nextActionColor={item.nextActionColor}
            onPress={() => router.push(`/plant/${item.id}`)}
            onQuickAction={() => {}}
            showToast={showToast}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={() => (
          searchQuery ? (
            <EmptySearchResults query={searchQuery} />
          ) : (
            <EmptyGardenState onAddPlant={() => router.push('/add-plant')} />
          )
        )}
        ListHeaderComponent={() => (
          filteredAndSortedPlants.length > 0 && (
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredAndSortedPlants.length} plant{filteredAndSortedPlants.length !== 1 ? 's' : ''}
                {searchQuery && ` found for "${searchQuery}"`}
                {activeFilter !== 'all' && ` (${filterOptions.find(f => f.key === activeFilter)?.label})`}
              </Text>
            </View>
          )
        )}
      />
      
      {/* Toast */}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.bgLight,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  filterTextActive: {
    color: Colors.white,
  },
  sortButton: {
    padding: Spacing.sm,
    marginRight: Spacing.md,
  },
  sortOptionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sortByText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  sortOptions: {
    flexDirection: 'row',
    flex: 1,
  },
  sortOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.xs,
  },
  sortOptionActive: {
    backgroundColor: Colors.bgLight,
  },
  sortOptionText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sortOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  resultsHeader: {
    paddingVertical: Spacing.sm,
  },
  resultsCount: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  emptySearchTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptySearchSubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});