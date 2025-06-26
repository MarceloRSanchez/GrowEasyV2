import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Droplets, Zap } from 'lucide-react-native';

interface ReviewCardProps {
  photoUrl: string;
  name: string;
  scientificName: string;
  nickname: string;
  wateringDays: number;
  fertilizingDays: number;
}

export function ReviewCard({
  photoUrl,
  name,
  scientificName,
  nickname,
  wateringDays,
  fertilizingDays,
}: ReviewCardProps) {
  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: photoUrl }} style={styles.image} />
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{name}</Text>
          <Text style={styles.scientificName}>{scientificName}</Text>
          <Text style={styles.nickname}>"{nickname}"</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>Care Schedule</Text>
        
        <View style={styles.scheduleItem}>
          <View style={styles.scheduleIcon}>
            <Droplets size={20} color={Colors.primary} />
          </View>
          <View style={styles.scheduleText}>
            <Text style={styles.scheduleLabel}>Watering</Text>
            <Text style={styles.scheduleValue}>Every {wateringDays} day{wateringDays !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        <View style={styles.scheduleItem}>
          <View style={styles.scheduleIcon}>
            <Zap size={20} color={Colors.secondary} />
          </View>
          <View style={styles.scheduleText}>
            <Text style={styles.scheduleLabel}>Fertilizing</Text>
            <Text style={styles.scheduleValue}>Every {fertilizingDays} day{fertilizingDays !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  scientificName: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: Spacing.xs,
  },
  nickname: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  scheduleContainer: {
    gap: Spacing.md,
  },
  scheduleTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  scheduleText: {
    flex: 1,
  },
  scheduleLabel: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  scheduleValue: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});