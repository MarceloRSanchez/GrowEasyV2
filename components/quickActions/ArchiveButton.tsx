import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Archive } from 'lucide-react-native';

interface ArchiveButtonProps {
  onArchive: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function ArchiveButton({ onArchive, disabled = false, loading = false }: ArchiveButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.container, isDisabled && styles.disabled]}
      onPress={onArchive}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={loading ? "Archiving plant" : "Archive plant"}
      accessibilityHint={
        isDisabled
          ? "Archive action is currently disabled"
          : "Tap to archive this plant and remove it from your active garden"
      }
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={Colors.error} 
          style={styles.icon}
        />
      ) : (
        <Archive 
          size={16} 
          color={isDisabled ? Colors.textMuted : Colors.error} 
          style={styles.icon} 
        />
      )}
      <Text style={[styles.label, { color: isDisabled ? Colors.textMuted : Colors.error }]}>
        {loading ? 'Archiving...' : 'Archive plant'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  label: {
    ...Typography.bodySmall,
    fontWeight: '500',
  },
});