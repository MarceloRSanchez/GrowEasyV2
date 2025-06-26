import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '@/constants/Colors';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

interface ChartSkeletonProps {
  type?: 'bar' | 'line' | 'dial';
}

export function ChartSkeleton({ type = 'bar' }: ChartSkeletonProps) {
  return (
    <View style={styles.container}>
      <LoadingSkeleton width={120} height={16} style={{ marginBottom: 12 }} />
      
      {type === 'bar' && (
        <View style={styles.barChart}>
          <View style={styles.barContainer}>
            {[1, 2, 3, 4, 5].map((i) => (
              <LoadingSkeleton
                key={i}
                width={20}
                height={Math.random() * 60 + 20}
                style={{ alignSelf: 'flex-end' }}
              />
            ))}
          </View>
        </View>
      )}
      
      {type === 'line' && (
        <View style={styles.lineChart}>
          <LoadingSkeleton width="80%" height={3} style={{ alignSelf: 'center' }} />
        </View>
      )}
      
      {type === 'dial' && (
        <View style={styles.dialChart}>
          <LoadingSkeleton width={120} height={120} borderRadius={60} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  barChart: {
    height: 120,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    justifyContent: 'flex-end',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  lineChart: {
    height: 120,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialChart: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
  },
});