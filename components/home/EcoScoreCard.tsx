import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Colors, Typography, Spacing, BorderRadius, heroGradient,
} from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Leaf, TrendingUp, TrendingDown, Flame, Droplets } from 'lucide-react-native';

interface EcoScoreCardProps {
  score: number;
  deltaWeek: number;
  streakDays: number;
  litersSaved: number;
  onBoost?: () => void;               // callback opcional para CTA
}
export function EcoScoreCard(props: EcoScoreCardProps & { variant?: 'lima' | 'menta' | 'coral' }) {
  const {
    score, deltaWeek, streakDays, litersSaved, onBoost,
    variant = 'lima',
  } = props;

  const palette = {
    lima: { box: 'hsla(144,72%,48%,0.25)', icon: 'hsl(144 72% 60%)', text: '#FFF' },
    menta: { box: 'hsl(163 70% 92%)', icon: 'hsl(163 70% 38%)', text: 'hsl(163 15% 15%)' },
    coral: { box: 'hsla(10,80%,60%,0.25)', icon: 'hsl(10 80% 70%)', text: '#FFF' },
  } as const;
  const { box, icon: iconColor, text: statText } = palette[variant];

  const deltaPositive = deltaWeek > 0;
  const deltaNeutral = deltaWeek === 0;

  /* helpers */
  const DeltaIcon = deltaNeutral ? null
    : deltaPositive ? TrendingUp : TrendingDown;
  const deltaColor = deltaNeutral
    ? 'rgba(255,255,255,.6)'
    : deltaPositive ? Colors.success : Colors.error;

  return (
    <Card style={styles.card} padding={0}>
      {/** Gradiente radial, más claro en el centro */}
      <LinearGradient
        colors={['#6FE9C1', '#34D399', '#10B981']}
        start={{ x: 0.3, y: 0.2 }}
        end={{ x: 1.0, y: 1.2 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Leaf size={24} color={Colors.white} />
          </View>
          <Text style={styles.title}>Eco Score</Text>
        </View>

        {/* Score + delta */}
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreText}>{score}</Text>

          <View style={[styles.deltaBox, { backgroundColor: `${deltaColor}22` }]}>
            {DeltaIcon && <DeltaIcon size={14} color={deltaColor} />}
            <Text style={[styles.deltaText, { color: deltaColor }]}>
              {deltaNeutral ? '--' : Math.abs(deltaWeek)} this week
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {/* Streak */}
          <View style={styles.statCol}>
            <View style={[styles.statIconBox, { backgroundColor: box }]}>
              <Flame size={20} color={iconColor} />
            </View>

            <Text style={[styles.statValue, { color: statText }]}>{streakDays}</Text>
            <Text style={[styles.statLabel, { color: statText, opacity: .8 }]} >day streak</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Water saved */}
          <View style={styles.statCol}>
            <View style={[styles.statIconBox, { backgroundColor: box }]}>
              <Droplets size={20} color={iconColor} />
            </View>
            <Text style={[styles.statValue, { color: statText }]}>{litersSaved} L</Text>
            <Text style={[styles.statLabel, { color: statText, opacity: .8 }]}>water saved</Text>
          </View>
        </View>

        {/* CTA opcional */}
        {onBoost && (
          <TouchableOpacity style={styles.cta} onPress={onBoost} activeOpacity={0.8}>
            <Text style={styles.ctaText}>Boost now</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Card>
  );
}

/* ───────────────────────── styles ───────────────────────── */
const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: Spacing.lg,
  },
  /* header */
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  iconBox: {
    width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  title: { ...Typography.h3, color: Colors.white },

  /* score */
  scoreBlock: { alignItems: 'center', marginBottom: Spacing.md },
  scoreText: {
    fontSize: 56,
    fontWeight: '700',
    color: Colors.white,
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  deltaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: Spacing.xs,
  },
  deltaText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginLeft: 4,
  },

  /* stats */
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statIconBox: {
    width: 32, height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: { ...Typography.body, color: Colors.white, fontWeight: '700', marginBottom: 2 },
  statLabel: { ...Typography.caption, color: 'rgba(27,27,27,0.9)' },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginHorizontal: Spacing.md,
  },

  /* CTA */
  cta: {
    marginTop: Spacing.lg,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 24,
  },
  ctaText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600',
  },
});