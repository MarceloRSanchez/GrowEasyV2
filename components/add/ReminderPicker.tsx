import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Minus, Plus } from 'lucide-react-native';

interface ReminderPickerProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
  min: number;
  max: number;
  error?: string;
}

export function ReminderPicker({ label, value, onChange, unit, min, max, error }: ReminderPickerProps) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.picker, error && styles.pickerError]}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={handleDecrease}
          disabled={value <= min}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label.toLowerCase()}`}
          accessibilityHint={`Currently ${value} ${unit}, minimum is ${min}`}
        >
          <Minus size={20} color={value <= min ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={handleIncrease}
          disabled={value >= max}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label.toLowerCase()}`}
          accessibilityHint={`Currently ${value} ${unit}, maximum is ${max}`}
        >
          <Plus size={20} color={value >= max ? Colors.textSecondary : Colors.primary} />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    fontWeight: '500',
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickerError: {
    borderColor: '#EF4444',
  },
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.white,
  },
  buttonDisabled: {
    backgroundColor: Colors.bgLight,
  },
  valueContainer: {
    alignItems: 'center',
    flex: 1,
  },
  value: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  unit: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: Spacing.xs,
  },
});