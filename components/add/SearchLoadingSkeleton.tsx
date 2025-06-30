import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/Colors';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

export interface SearchLoadingSkeletonProps {
  count?: number;
}

export function SearchLoadingSkeleton({ count = 3 }: SearchLoadingSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.skeletonItem}>
          <LoadingSkeleton width={80} height={80} borderRadius={BorderRadius.sm} />
          <View style={styles.skeletonContent}>
            <LoadingSkeleton width={120} height={18} style={{ marginBottom: 4 }} />
            <LoadingSkeleton width={100} height={14} style={{ marginBottom: 8 }} />
            <View style={styles.skeletonBadges}>
              <LoadingSkeleton width={60} height={20} borderRadius={10} />
              <LoadingSkeleton width={80} height={20} borderRadius={10} style={{ marginLeft: 8 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    paddingTop: Spacing.sm,
  },
  skeletonItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  skeletonContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  skeletonBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});