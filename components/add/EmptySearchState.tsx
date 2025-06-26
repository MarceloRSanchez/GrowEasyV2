import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Search, RefreshCw } from 'lucide-react-native';

interface EmptySearchStateProps {
  query: string;
  onRetry?: () => void;
}

export function EmptySearchState({ query, onRetry }: EmptySearchStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <Image
          source={{
            uri: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=400'
          }}
          style={styles.image}
        />
        <View style={styles.overlay}>
          <Search size={48} color={Colors.primary} />
        </View>
      </View>
      
      <Text style={styles.title}>No plants found</Text>
      <Text style={styles.subtitle}>
        We couldn't find any plants matching "{query}". Try a different search term, check your spelling, or browse our plant catalog.
      </Text>
      
      {onRetry && (
        <Button
          title="Try again"
          onPress={onRetry}
          variant="outline"
          style={styles.retryButton}
        />
      )}
      
      <View style={styles.suggestions}>
        <Text style={styles.suggestionsTitle}>Popular searches:</Text>
        <View style={styles.suggestionTags}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Basil</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Tomato</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Mint</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Lettuce</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 253, 251, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  retryButton: {
    marginBottom: Spacing.xl,
  },
  suggestions: {
    alignItems: 'center',
  },
  suggestionsTitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: Colors.bgLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});