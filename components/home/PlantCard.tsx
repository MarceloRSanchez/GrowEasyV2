import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Droplets, Zap, Scissors, ChevronRight } from 'lucide-react-native';

interface PlantCardProps {
  photoUrl: string;
  name: string;
  species: string;
  progressPct: number;
  nextActionLabel: string;
  nextActionColor: string;
  onPress: () => void;
  onQuickAction?: () => void;
}

export function PlantCard({
  photoUrl,
  name,
  species,
  progressPct,
  nextActionLabel,
  nextActionColor,
  onPress,
  onQuickAction,
}: PlantCardProps) {
  const getActionIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('water')) {
      return <Droplets size={14} color={nextActionColor} />;
    }
    if (lowerLabel.includes('fertilize')) {
      return <Zap size={14} color={nextActionColor} />;
    }
    if (lowerLabel.includes('harvest')) {
      return <Scissors size={14} color={nextActionColor} />;
    }
    return null;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      onLongPress={onQuickAction}
      activeOpacity={0.8}
      delayLongPress={500}
    >
      <View style={styles.content}>
        {/* Left: Plant Photo */}
        <Image source={{ uri: photoUrl }} style={styles.plantImage} />
        
        {/* Right: Plant Info */}
        <View style={styles.plantInfo}>
          {/* Top Row: Name & Species */}
          <View style={styles.nameSection}>
            <Text style={styles.plantName} numberOfLines={1}>{name}</Text>
            <Text style={styles.plantSpecies} numberOfLines={1}>{species}</Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <ProgressBar progress={progressPct} height={4} />
            <Text style={styles.progressText}>{progressPct}% grown</Text>
          </View>
          
          {/* Bottom Row: Next Action Chip & Chevron */}
          <View style={styles.bottomRow}>
            <View style={[styles.nextActionChip, { backgroundColor: `${nextActionColor}20` }]}>
              {getActionIcon(nextActionLabel)}
              <Text style={[styles.nextActionText, { color: nextActionColor }]} numberOfLines={1}>
                {nextActionLabel}
              </Text>
            </View>
            <ChevronRight size={16} color={Colors.textMuted} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
    maxHeight: 88,
  },
  content: {
    flexDirection: 'row',
    padding: Spacing.sm,
    alignItems: 'center',
  },
  plantImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.sm,
    resizeMode: 'cover',
  },
  plantInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'space-between',
    height: 64,
  },
  nameSection: {
    marginBottom: Spacing.xs,
  },
  plantName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: 2,
  },
  plantSpecies: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  progressSection: {
    marginBottom: Spacing.xs,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    flex: 1,
    marginRight: Spacing.sm,
  },
  nextActionText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    marginLeft: 4,
    flex: 1,
  },
});