import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/Colors';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CircleCheck as CheckCircle, ArrowRight } from 'lucide-react-native';

interface TodayCareCardProps {
  taskLabel: string;
  plants: string[];
  onPressDone: () => void;
}

export function TodayCareCard({ taskLabel, plants, onPressDone }: TodayCareCardProps) {
  const displayPlants = plants.slice(0, 2);
  const remainingCount = plants.length - 2;

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <CheckCircle size={20} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Today's Care</Text>
      </View>

      <Text style={styles.taskLabel}>{taskLabel}</Text>
      
      <View style={styles.plantsContainer}>
        {displayPlants.map((plant, index) => (
          <View key={index} style={styles.plantTag}>
            <Text style={styles.plantName}>{plant}</Text>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.plantTag, styles.remainingTag]}>
            <Text style={styles.remainingText}>+{remainingCount} more</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.actionRow} onPress={onPressDone}>
        <Text style={styles.actionText}>Mark as done</Text>
        <ArrowRight size={16} color={Colors.primary} />
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#F0F9FF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  taskLabel: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  plantsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  plantTag: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  plantName: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  remainingTag: {
    backgroundColor: Colors.bgLight,
    borderColor: Colors.border,
  },
  remainingText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionText: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
});