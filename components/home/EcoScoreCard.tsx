import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, heroGradient } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { LinearGradient } from 'expo-linear-gradient';
import { Leaf, TrendingUp, Flame, Droplets } from 'lucide-react-native';

interface EcoScoreCardProps {
  score: number;
  deltaWeek: number;
  streakDays: number;
  litersSaved: number;
}

export function EcoScoreCard({ score, deltaWeek, streakDays, litersSaved }: EcoScoreCardProps) {
  const getDeltaColor = (delta: number) => {
    if (delta > 0) return Colors.success;
    if (delta < 0) return Colors.error;
    return Colors.textMuted;
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return '↗';
    if (delta < 0) return '↘';
    return '→';
  };

  return (
    <Card style={styles.container} padding={0}>
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Leaf size={24} color={Colors.white} />
          </View>
          <Text style={styles.title}>Eco Score</Text>
        </View>

        <View style={styles.scoreSection}>
          <Text style={styles.score}>{score}</Text>
          <View style={styles.deltaContainer}>
            <Text style={styles.delta}>
              {getDeltaIcon(deltaWeek)} {Math.abs(deltaWeek)} this week
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <View style={styles.statIcon}>
              <Flame size={16} color={Colors.textPrimary} />
            </View>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>
          
          <View style={styles.stat}>
            <View style={styles.statIcon}>
              <Droplets size={16} color={Colors.textPrimary} />
            </View>
            <Text style={styles.statValue}>{litersSaved}L</Text>
            <Text style={styles.statLabel}>water saved</Text>
          </View>
        </View>
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  gradientContainer: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    color: Colors.white,
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  score: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.white,
    fontFamily: 'Inter-Bold',
  },
  deltaContainer: {
    marginTop: Spacing.xs,
  },
  delta: {
    ...Typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Spacing.lg,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    ...Typography.caption,
    color: '#1B1B1B',
  },
});