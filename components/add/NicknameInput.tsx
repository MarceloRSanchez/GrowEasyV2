import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';

interface NicknameInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  autoFocus?: boolean;
}

export function NicknameInput({ value, onChange, error, autoFocus }: NicknameInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Plant nickname</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChange}
        placeholder="e.g. My first basil"
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="words"
        autoCorrect={false}
        autoFocus={autoFocus}
        returnKeyType="next"
        maxLength={24}
        accessibilityLabel="Plant nickname"
        accessibilityHint="Enter a name for your plant, 2 to 24 characters"
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  input: {
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    ...Typography.bodySmall,
    color: '#EF4444',
    marginTop: Spacing.xs,
  },
});