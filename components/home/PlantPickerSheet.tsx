import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { useDebounce } from '@/hooks/useDebounce';
import { Search, Droplets, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface PlantPickerSheetProps {
  bottomSheetRef: React.RefObject<BottomSheetModal>;
  onConfirm: (userPlantId: string) => void;
}

interface PlantItem {
  id: string;
  name: string;
  photoUrl: string;
}

export function PlantPickerSheet({ 
  bottomSheetRef, 
  onConfirm 
}: PlantPickerSheetProps) {
  const { user } = useAuth();
  const { data, loading } = useHomeSnapshot(user?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ['90%'], []);
  
  // Filter plants based on search query
  const filteredPlants = useMemo(() => {
    if (!data?.plants) return [];
    
    if (!debouncedQuery) return data.plants;
    
    const query = debouncedQuery.toLowerCase();
    return data.plants.filter(plant => 
      plant.name.toLowerCase().includes(query) || 
      (plant.species && plant.species.toLowerCase().includes(query))
    );
  }, [data?.plants, debouncedQuery]);
  
  // Handle plant selection
  const handleSelectPlant = useCallback((plantId: string) => {
    setSelectedPlantId(plantId);
    
    // Trigger haptic feedback on mobile
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);
  
  // Handle water action confirmation
  const handleConfirm = useCallback(() => {
    if (selectedPlantId) {
      onConfirm(selectedPlantId);
    }
  }, [selectedPlantId, onConfirm]);
  
  // Reset state when sheet is closed
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      setSearchQuery('');
      setSelectedPlantId(null);
    }
  }, []);
  
  // Render backdrop component
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
  
  // Render plant item
  const renderPlantItem = useCallback(({ item }: { item: PlantItem }) => (
    <TouchableOpacity
      style={[
        styles.plantItem,
        selectedPlantId === item.id && styles.selectedPlantItem
      ]}
      onPress={() => handleSelectPlant(item.id)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${item.name}`}
      accessibilityHint={`Tap to select ${item.name} for watering`}
      accessibilityState={{ selected: selectedPlantId === item.id }}
    >
      <Image source={{ uri: item.photoUrl }} style={styles.plantImage} />
      <Text style={styles.plantName}>{item.name}</Text>
      {selectedPlantId === item.id && (
        <View style={styles.checkmark}>
          <Droplets size={16} color={Colors.white} />
        </View>
      )}
    </TouchableOpacity>
  ), [selectedPlantId, handleSelectPlant]);
  
  // Render empty list component
  const renderEmptyComponent = useCallback(() => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <>
          <Text style={styles.emptyTitle}>No plants found</Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? `No plants matching "${searchQuery}"`
              : "You don't have any plants yet"}
          </Text>
        </>
      )}
    </View>
  ), [loading, searchQuery]);
  
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      accessibilityLabel="Select plant to water"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Water a Plant</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => bottomSheetRef.current?.close()}
            accessibilityRole="button"
            accessibilityLabel="Close"
            accessibilityHint="Closes the plant selection sheet"
          >
            <X size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
        
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your plants..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search plants"
            accessibilityHint="Type to filter your plants"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Plant List */}
        <FlatList
          data={filteredPlants}
          renderItem={renderPlantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyComponent}
          accessibilityLabel="Plant list"
          accessibilityHint="Select a plant to water"
        />
        
        {/* Action Button */}
        <View style={styles.footer}>
          <Button
            title="Log Water"
            onPress={handleConfirm}
            disabled={!selectedPlantId}
            size="large"
            style={styles.waterButton}
            accessibilityLabel="Log water button"
            accessibilityHint={selectedPlantId 
              ? "Tap to log watering for selected plant" 
              : "Select a plant first to enable this button"}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  listContainer: {
    paddingVertical: Spacing.sm,
    paddingBottom: 100, // Add extra padding at the bottom to ensure items are visible above keyboard
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedPlantItem: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  plantImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: Spacing.md,
  },
  plantName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  waterButton: {
    width: '100%',
    marginHorizontal: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});