import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  results?: any[];
}

export function SearchBar({ value, onChange, placeholder, results }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Search size={20} color={Colors.textSecondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        accessibilityLabel="Search plants"
        accessibilityHint={results?.length ? `${results.length} plants available` : "Type to search plants"}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => onChange('')}
          accessibilityLabel="Clear search"
          accessibilityRole="button"
        >
          <View style={styles.clearButtonInner}>
            <Text style={styles.clearButtonText}>×</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  clearButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20,
  },
});