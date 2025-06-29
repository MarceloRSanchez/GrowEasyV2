import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, Grid, Line } from 'react-native-svg-charts';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { startOfWeek, format, parseISO } from 'date-fns';
import { EmptyState } from '@/components/empty/EmptyState';

const { width } = Dimensions.get('window');

interface WaterHistoryData {
  date: string;
  ml: number;
}

interface WaterHistoryChartProps {
  data: WaterHistoryData[];
  onQuickWater?: () => void;
  loading?: boolean;
  error?: boolean;
}

export function WaterHistoryChart({ data, onQuickWater, loading, error }: WaterHistoryChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      value: item.ml,
      label: dayjs(item.date).format('DD MMM'),
      svg: { fill: Colors.accent },
    }));
    
    // Group data by week
    const weeklyData = data.reduce((acc, item) => {
      const date = parseISO(item.date);
      const weekStart = format(startOfWeek(date), 'yyyy-MM-dd');
      
      if (!acc[weekStart]) {
        acc[weekStart] = { date: weekStart, ml: 0 };
      }
      
      acc[weekStart].ml += item.ml;
      return acc;
    }, {} as Record<string, { date: string; ml: number }>);
    
    return Object.values(weeklyData).map(item => ({
      value: item.ml,
      label: format(parseISO(item.date), 'MMM d'),
      svg: { fill: Colors.accent },
    }));
  }, [data]);
  
  // Check if we have enough data to show a meaningful chart
  const isSparse = data.length < 3;

  if (loading) {
    return <ChartSkeleton title="Watering History" />;
  }

  if (error) {
    return <ChartError title="Watering History" />;
  }

  if (!data || data.length === 0 || isSparse) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Watering History</Text>
        <EmptyState
          icon="💧"
          title="No watering trend yet"
          subtitle="Log a few waterings and you'll see the chart here."
          ctaLabel="Log Water Now"
          onPress={onQuickWater}
        />
      </View>
    );
  }

  // Calculate total water volume
  const totalMl = data.reduce((sum, item) => sum + item.ml, 0);
  
  // Daily water goal (250ml per day)
  const waterGoal = 250;
  
  // Create horizontal goal line data
  const goalLineData = [{ y: waterGoal }, { y: waterGoal }];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watering History</Text>
      <View style={styles.chartContainer}>
        <BarChart
          style={styles.chart}
          data={chartData}
          yAccessor={({ item }) => item.value}
          svg={{ fill: Colors.accent }}
          contentInset={{ top: 20, bottom: 20, left: 10, right: 10 }}
          spacingInner={0.3}
          spacingOuter={0.2}
          animate={true}
          animationDuration={300}
          gridMin={0}
          roundedCorners={4}
        >
          <Grid direction="HORIZONTAL" />
          <Line
            data={goalLineData}
            svg={{ stroke: '#E0E7FF', strokeWidth: 2, strokeDasharray: [6, 3] }}
          />
        </BarChart>
        
        {/* Goal line label */}
        <View style={styles.goalLabel}>
          <Text style={styles.goalText}>Goal</Text>
        </View>
      </View>
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          Total: {(totalMl / 1000).toFixed(1)}L over {data.length} days
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
    height: 200,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  chart: {
    flex: 1,
  },
  goalLabel: {
    position: 'absolute',
    right: Spacing.sm,
    top: 20,
    backgroundColor: '#E0E7FF',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  goalText: {
    ...Typography.caption,
    color: '#4F46E5',
    fontWeight: '500',
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