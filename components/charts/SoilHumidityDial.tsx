import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';

// Dial Skeleton Component
function DialSkeleton() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soil Humidity</Text>
      <View style={styles.dialContainer}>
        <View style={[styles.dial, styles.skeletonDial]}>
          <View style={[styles.dialInner, styles.skeletonDialInner]}>
            <View style={styles.skeletonValue} />
            <View style={styles.skeletonLabel} />
          </View>
        </View>
      </View>
    </View>
  );
}

// Dial Error Component
function DialError() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soil Humidity</Text>
      <View style={styles.dialContainer}>
        <View style={[styles.dial, { borderColor: Colors.error }]}>
          <View style={[styles.dialInner, { backgroundColor: '#FEF2F2' }]}>
            <Text style={[styles.dialValue, { color: Colors.error }]}>—</Text>
            <Text style={[styles.dialLabel, { color: Colors.error }]}>Error</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface SoilHumidityDialProps {
  humidity: number | null;
  loading?: boolean;
  error?: boolean;
}

export function SoilHumidityDial({ humidity, loading, error }: SoilHumidityDialProps) {
  const dialConfig = useMemo(() => {
    if (humidity === null || humidity === undefined) {
      return {
        value: '—',
        color: Colors.textMuted,
        label: 'No data',
        percentage: 0,
      };
    }

    let color = Colors.primary;
    let label = 'Optimal';

    if (humidity < 30) {
      color = Colors.error;
      label = 'Too dry';
    } else if (humidity > 70) {
      color = Colors.warning;
      label = 'Too wet';
    }

    return {
      value: `${Math.round(humidity)}%`,
      color,
      label,
      percentage: Math.min(100, Math.max(0, humidity)),
    };
  }, [humidity]);

  if (loading) {
    return <DialSkeleton />;
  }

  if (error) {
    return <DialError />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soil Humidity</Text>
      <View style={styles.dialContainer}>
        <View style={[styles.dial, { borderColor: dialConfig.color }]}>
          <View style={[styles.dialInner, { backgroundColor: dialConfig.color }]}>
            <Text style={styles.dialValue}>{dialConfig.value}</Text>
            <Text style={styles.dialLabel}>{dialConfig.label}</Text>
          </View>
        </View>
        
        {/* Progress Ring */}
        <View style={styles.progressRing}>
          <View 
            style={[
              styles.progressFill,
              {
                backgroundColor: dialConfig.color,
                transform: [{ rotate: `${(dialConfig.percentage / 100) * 180}deg` }],
              }
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  dialContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dial: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dialInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialValue: {
    ...Typography.h2,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  dialLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  progressRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Colors.border,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  progressFill: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: Colors.primary,
    borderRightColor: Colors.primary,
    transformOrigin: 'center',
  },
  skeletonDial: {
    borderColor: Colors.border,
  },
  skeletonDialInner: {
    backgroundColor: Colors.bgLight,
  },
  skeletonValue: {
    width: 40,
    height: 24,
    backgroundColor: Colors.border,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonLabel: {
    width: 60,
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 4,
  },
});