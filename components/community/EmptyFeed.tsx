import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import { Users } from 'lucide-react-native';

interface EmptyFeedProps {
  onRefresh?: () => void;
}

export function EmptyFeed({ onRefresh }: EmptyFeedProps) {
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
          <Users size={64} color={Colors.primary} />
        </View>
      </View>
      
      <Text style={styles.title}>No posts yet</Text>
      <Text style={styles.subtitle}>
        Be the first to share your gardening journey with the community!
      </Text>
      
      {onRefresh && (
        <Button
          title="Refresh"
          onPress={onRefresh}
          variant="outline"
          style={styles.refreshButton}
        />
      )}
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
    width: 160,
    height: 160,
    borderRadius: 80,
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
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  refreshButton: {
    minWidth: 120,
  },
});