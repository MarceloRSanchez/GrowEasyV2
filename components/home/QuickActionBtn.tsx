import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Plus, Droplets, Zap } from 'lucide-react-native';

export type IconName = 'add' | 'water' | 'fertilize';

interface QuickActionBtnProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

const iconMap = {
  add: Plus,
  water: Droplets,
  fertilize: Zap,
};

const iconColors = {
  add: Colors.primary,
  water: Colors.accent,
  fertilize: Colors.warning,
};

export function QuickActionBtn({ icon, label, onPress }: QuickActionBtnProps) {
  const IconComponent = iconMap[icon];
  const iconColor = iconColors[icon];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <IconComponent size={24} color={iconColor} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
});