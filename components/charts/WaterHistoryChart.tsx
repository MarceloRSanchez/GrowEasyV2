import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-svg-charts';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import dayjs from 'dayjs';

const { width } = Dimensions.get('window');

interface WaterHistoryData {
  date: string;
  ml: number;
}

interface WaterHistoryChartProps {
  data: WaterHistoryData[];
  loading?: boolean;
  error?: boolean;
}

export function WaterHistoryChart({ data, loading, error }: WaterHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      value: item.ml,
      label: dayjs(item.date).format('DD MMM'),
      svg: { fill: Colors.accent },
    }));
  }, [data]);

  if (loading) {
    return <ChartSkeleton title="Watering History" />;
  }

  if (error) {
    return <ChartError title="Watering History" />;
  }

  if (!data || data.length === 0) {
    return <ChartEmpty title="Watering History" message="No watering records yet" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watering History</Text>
      <View style={styles.chartContainer}>
        <BarChart
          style={styles.chart}
          data={chartData}
          yAccessor={({ item }) => item.value}
          svg={{ fill: Colors.accent }}
          contentInset={{ top: 20, bottom: 20 }}
          spacingInner={0.3}
          spacingOuter={0.2}
          animate="true"
          animationDuration={300}
        />
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Total: {data.reduce((sum, item) => sum + item.ml, 0)}ml over {data.length} days
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
        <View style={styles.skeletonBars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={[
                styles.skeletonBar,
                { height: Math.random() * 60 + 20 }
              ]}
            />
          ))}
        </View>
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
    justifyContent: 'flex-end',
  },
  skeletonBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
  },
  skeletonBar: {
    width: 20,
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