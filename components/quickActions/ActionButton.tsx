import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Droplets, Zap, Scissors } from 'lucide-react-native';

export type ActionType = 'water' | 'fertilize' | 'harvest';

interface ActionButtonProps {
  type: ActionType;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ActionButton({ type, onPress, disabled = false, loading = false }: ActionButtonProps) {
  const getActionConfig = () => {
    switch (type) {
      case 'water':
        return {
          icon: <Droplets size={28} color={Colors.white} />,
          label: 'Water',
          backgroundColor: Colors.accent,
          shadowColor: Colors.accent,
        };
      case 'fertilize':
        return {
          icon: <Zap size={28} color={Colors.white} />,
          label: 'Fertilize',
          backgroundColor: Colors.secondary,
          shadowColor: Colors.secondary,
        };
      case 'harvest':
        return {
          icon: <Scissors size={28} color={Colors.white} />,
          label: 'Harvest',
          backgroundColor: Colors.success,
          shadowColor: Colors.success,
        };
    }
  };

  const config = getActionConfig();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isDisabled ? Colors.border : config.backgroundColor,
          shadowColor: isDisabled ? Colors.border : config.shadowColor,
          shadowOpacity: isDisabled ? 0 : 0.2,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={loading ? `${config.label} in progress` : `${config.label} plant`}
      accessibilityHint={
        isDisabled 
          ? `${config.label} action is currently disabled`
          : `Tap to log ${config.label.toLowerCase()} action for this plant`
      }
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.iconContainer}>
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={Colors.white} 
          />
        ) : (
          React.cloneElement(config.icon, {
            color: isDisabled ? Colors.textMuted : Colors.white,
          })
        )}
      </View>
      <Text style={[styles.label, { color: isDisabled ? Colors.textMuted : Colors.white }]}>
        {loading ? 'Loading...' : config.label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    minHeight: 80,
  },
  iconContainer: {
    marginBottom: Spacing.xs,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
});