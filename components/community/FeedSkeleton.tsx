import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants/Colors';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = (width - Spacing.md * 2) * 1.25; // 4:5 aspect ratio

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.postSkeleton}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <LoadingSkeleton 
                width={40} 
                height={40} 
                borderRadius={20} 
                style={styles.avatarSkeleton} 
              />
              <LoadingSkeleton 
                width={120} 
                height={16} 
              />
            </View>
            <LoadingSkeleton 
              width={60} 
              height={12} 
            />
          </View>

          {/* Image */}
          <LoadingSkeleton 
            width="100%" 
            height={IMAGE_HEIGHT} 
          />

          {/* Actions */}
          <View style={styles.actions}>
            <LoadingSkeleton 
              width={80} 
              height={24} 
              style={styles.actionSkeleton} 
            />
            <LoadingSkeleton 
              width={80} 
              height={24} 
              style={styles.actionSkeleton} 
            />
            <LoadingSkeleton 
              width={40} 
              height={24} 
            />
          </View>

          {/* Caption (50% chance) */}
          {Math.random() > 0.5 && (
            <View style={styles.captionContainer}>
              <LoadingSkeleton 
                width="100%" 
                height={16} 
                style={styles.captionLine} 
              />
              <LoadingSkeleton 
                width="80%" 
                height={16} 
                style={styles.captionLine} 
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
  },
  postSkeleton: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSkeleton: {
    marginRight: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    padding: Spacing.md,
  },
  actionSkeleton: {
    marginRight: Spacing.lg,
  },
  captionContainer: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  captionLine: {
    marginBottom: Spacing.xs,
  },
});