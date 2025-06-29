import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { EmptyState } from '@/components/empty/EmptyState';

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
      return null;
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

  // Show empty state when humidity is 0 (sensor offline)
  if (humidity === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Soil Humidity</Text>
        <EmptyState
          icon="🛑"
          title="Sensor offline"
          subtitle="Sensor offline or no readings yet."
        />
      </View>
    );
  }

  // Show empty state when no data
  if (!dialConfig) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Soil Humidity</Text>
        <EmptyState
          icon="💧"
          title="No humidity data"
          subtitle="Humidity readings will appear here."
        />
      </View>
    );
  }

  // Calculate the angle for the semi-gauge (0-180 degrees)
  const angle = (dialConfig.percentage / 100) * 180;
  
  // Calculate the coordinates for the arc
  const radius = 70;
  const cx = 80;
  const cy = 80;
  
  // Calculate the end point of the arc
  const endX = cx + radius * Math.sin((angle * Math.PI) / 180);
  const endY = cy - radius * Math.cos((angle * Math.PI) / 180);
  
  // Create the path for the arc
  const path = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY}`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soil Humidity</Text>
      <View style={styles.gaugeContainer}>
        <Svg width={160} height={100} viewBox="0 0 160 100">
          {/* Background track */}
          <Path
            d={`M 10 80 A 70 70 0 0 1 150 80`}
            stroke="#F1F1F1"
            strokeWidth={18}
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Value arc */}
          <Path
            d={`M 10 80 A 70 70 0 ${angle > 90 ? 1 : 0} 1 ${endX} ${endY}`}
            stroke={dialConfig.color}
            strokeWidth={18}
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
        
        <Text style={styles.gaugeValue}>{dialConfig.value}</Text>
        <Text style={[styles.gaugeLabel, { color: dialConfig.color }]}>{dialConfig.label}</Text>
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
    marginBottom: Spacing.sm,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 160,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  gaugeValue: {
    ...Typography.h2,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  gaugeLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
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