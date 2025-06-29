import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { WaterHistoryChart } from '@/components/charts/WaterHistoryChart';
import { SunExposureChart } from '@/components/charts/SunExposureChart';
import { SoilHumidityDial } from '@/components/charts/SoilHumidityDial';

type TabType = 'water' | 'sun' | 'humidity';

interface AnalyticsTabsProps {
  water: Array<{ date: string; ml: number }>;
  sun: Array<{ date: string; hours: number }>;
  humidity: number | null;
  loading: boolean;
  error: boolean;
}

export function AnalyticsTabs({ water, sun, humidity, loading, error }: AnalyticsTabsProps) {
  const [selected, setSelected] = useState<TabType>('water');

  return (
    <View style={styles.container}>
      {/* Segment Control */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, selected === 'water' && styles.selectedTab]}
          onPress={() => setSelected('water')}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === 'water' }}
        >
          <Text 
            style={[styles.tabText, selected === 'water' && styles.selectedTabText]}
          >
            Water
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selected === 'sun' && styles.selectedTab]}
          onPress={() => setSelected('sun')}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === 'sun' }}
        >
          <Text 
            style={[styles.tabText, selected === 'sun' && styles.selectedTabText]}
          >
            Sun
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, selected === 'humidity' && styles.selectedTab]}
          onPress={() => setSelected('humidity')}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === 'humidity' }}
        >
          <Text 
            style={[styles.tabText, selected === 'humidity' && styles.selectedTabText]}
          >
            Humidity
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Chart Content */}
      <View style={styles.chartContainer}>
        {selected === 'water' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.chartWrapper}>
            <WaterHistoryChart data={water} loading={loading} error={error} />
          </Animated.View>
        )}
        
        {selected === 'sun' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.chartWrapper}>
            <SunExposureChart data={sun} loading={loading} error={error} />
          </Animated.View>
        )}
        
        {selected === 'humidity' && (
          <Animated.View entering={FadeIn.duration(300)} style={styles.chartWrapper}>
            <SoilHumidityDial humidity={humidity} loading={loading} error={error} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  selectedTab: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  selectedTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  chartContainer: {
    minHeight: 200,
  },
  chartWrapper: {
    flex: 1,
  },
});