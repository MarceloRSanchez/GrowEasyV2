import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-svg-charts';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import dayjs from 'dayjs';

interface SunExposureData {
  date: string;
  hours: number;
}

interface SunExposureChartProps {
  data: SunExposureData[];
  loading?: boolean;
  error?: boolean;
}

export function SunExposureChart({ data, loading, error }: SunExposureChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => item.hours);
  }, [data]);

  if (loading) {
    return <ChartSkeleton title="Sun Exposure" />;
  }

  if (error) {
    return <ChartError title="Sun Exposure" />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty title="Sun Exposure" message="No sun exposure data yet" />;
  }

  const averageHours = data.reduce((sum, item) => sum + item.hours, 0) / data.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sun Exposure</Text>
      <View style={styles.chartContainer}>
        <LineChart
          style={styles.chart}
          data={chartData}
          svg={{ 
            stroke: Colors.warning,
            strokeWidth: 3,
          }}
          contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
          animate="true"
          animationDuration={300}
        />
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Average: {averageHours.toFixed(1)} hours/day over {data.length} days
        </Text>
      </View>
    </View>
  );
}

// Chart Skeleton Component
function ChartSkeleton({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.chartContainer, styles.skeletonChart]}>
        <View style={styles.skeletonLine} />
      </View>
    </View>
  );
}

// Chart Error Component
function ChartError({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.chartContainer, styles.errorChart]}>
        <Text style={styles.errorText}>Couldn't load analytics</Text>
      </View>
    </View>
  );
}

// Chart Empty Component
function ChartEmpty({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.chartContainer, styles.emptyChart]}>
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  chartContainer: {
    height: 120,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chart: {
    flex: 1,
  },
  legend: {
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
  skeletonChart: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  skeletonLine: {
    width: '80%',
    height: 3,
    backgroundColor: Colors.border,
    borderRadius: 2,
    opacity: 0.6,
  },
  errorChart: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
  },
  emptyChart: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
  },
});