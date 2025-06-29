import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Pencil, Check, X } from 'lucide-react-native';

interface DisplayNameEditorProps {
  displayName: string | null;
  email: string;
  onSave: (name: string) => Promise<void>;
  disabled?: boolean;
}

export function DisplayNameEditor({
  displayName,
  email,
  onSave,
  disabled = false,
}: DisplayNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(displayName || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Update local state when prop changes
  useEffect(() => {
    setName(displayName || '');
  }, [displayName]);

  const handleStartEditing = () => {
    if (disabled) return;
    setIsEditing(true);
    setError(null);
    
    // Focus the input after a short delay to ensure it's rendered
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(displayName || '');
    setError(null);
    Keyboard.dismiss();
  };

  const validateName = (value: string): boolean => {
    if (value.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    
    if (value.trim().length > 20) {
      setError('Name must be at most 20 characters');
      return false;
    }
    
    // Check for emojis using a simple regex
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    if (emojiRegex.test(value)) {
      setError('Name cannot contain emojis');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (disabled || isSaving) return;
    
    const trimmedName = name.trim();
    
    if (!validateName(trimmedName)) {
      return;
    }
    
    try {
      setIsSaving(true);
      await onSave(trimmedName);
      setIsEditing(false);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error saving display name:', error);
      setError('Failed to save name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Display either the display name or email as fallback
  const displayText = displayName || email.split('@')[0];

  return (
    <View style={styles.container}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            ref={inputRef}
            style={[styles.input, error && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            maxLength={20}
            autoCapitalize="words"
            onSubmitEditing={handleSave}
            editable={!isSaving}
            accessibilityLabel="Display name input"
            accessibilityHint="Enter your display name, 2 to 20 characters"
          />
          
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSaving}
              accessibilityLabel="Cancel editing"
              accessibilityRole="button"
            >
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaving}
              accessibilityLabel="Save display name"
              accessibilityRole="button"
            >
              <Check size={16} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.displayContainer}
          onPress={handleStartEditing}
          disabled={disabled}
          accessibilityLabel="Edit display name"
          accessibilityRole="button"
          accessibilityHint="Tap to edit your display name"
        >
          <Text style={styles.displayName}>{displayText}</Text>
          <Pencil size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  displayName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    ...Typography.body,
    flex: 1,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputError: {
    borderColor: Colors.error,
  },
  editActions: {
    flexDirection: 'row',
    marginLeft: Spacing.sm,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  cancelButton: {
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  errorText: {
    ...Typography.bodySmall,
    color: Colors.error,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});