import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/Colors';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function LoadingSkeleton({ 
  width = '100%', 
  height = 20, 
  borderRadius = BorderRadius.sm,
  style 
}: LoadingSkeletonProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, '#E5E7EB'],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
}

export function HomeLoadingSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View>
          <LoadingSkeleton width={200} height={28} style={{ marginBottom: 8 }} />
          <LoadingSkeleton width={150} height={16} />
        </View>
        <LoadingSkeleton width={48} height={48} borderRadius={24} />
      </View>

      {/* Eco Score Card Skeleton */}
      <View style={styles.ecoCard}>
        <LoadingSkeleton width={120} height={24} style={{ marginBottom: 16 }} />
        <LoadingSkeleton width={80} height={48} style={{ marginBottom: 8, alignSelf: 'center' }} />
        <LoadingSkeleton width={100} height={16} style={{ marginBottom: 24, alignSelf: 'center' }} />
        <View style={styles.statsRow}>
          <LoadingSkeleton width={60} height={40} />
          <LoadingSkeleton width={60} height={40} />
        </View>
      </View>

      {/* Quick Actions Skeleton */}
      <View style={styles.quickActions}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.quickAction}>
            <LoadingSkeleton width={64} height={64} borderRadius={32} style={{ marginBottom: 8 }} />
            <LoadingSkeleton width={60} height={14} />
          </View>
        ))}
      </View>

      {/* Plants List Skeleton */}
      <View style={styles.plantsSection}>
        <View style={styles.sectionHeader}>
          <LoadingSkeleton width={100} height={20} />
          <LoadingSkeleton width={50} height={16} />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.plantCard}>
            <LoadingSkeleton width={80} height={80} />
            <View style={styles.plantInfo}>
              <LoadingSkeleton width={120} height={18} style={{ marginBottom: 4 }} />
              <LoadingSkeleton width={100} height={14} style={{ marginBottom: 12 }} />
              <LoadingSkeleton width="100%" height={6} style={{ marginBottom: 8 }} />
              <LoadingSkeleton width={80} height={14} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.border,
  },
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
  ecoCard: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
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
  plantCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  plantInfo: {
    flex: 1,
    padding: Spacing.md,
  },
});