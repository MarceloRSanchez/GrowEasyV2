import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { Droplets, Zap, Scissors, X } from 'lucide-react-native';
import { CareReminder } from '@/types/Plant';

interface DayTasksCardProps {
  tasks: CareReminder[];
  onTaskComplete: (taskId: string) => void;
  onClose: () => void;
  visible: boolean;
}

export function DayTasksCard({ tasks, onTaskComplete, onClose, visible }: DayTasksCardProps) {
  const getIcon = (type: CareReminder['type']) => {
    switch (type) {
      case 'watering':
        return <Droplets size={20} color={Colors.primary} />;
      case 'fertilizing':
        return <Zap size={20} color="#7ED321" />;
      case 'harvesting':
        return <Scissors size={20} color="#F5A623" />;
      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Tasks for Today</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks for today</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskItem}
                onPress={() => onTaskComplete(task.id)}
              >
                <View style={styles.taskIcon}>
                  {getIcon(task.type)}
                </View>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskType}>
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                  </Text>
                  {task.notes && (
                    <Text style={styles.taskNotes} numberOfLines={2}>
                      {task.notes}
                    </Text>
                  )}
                </View>
                <View style={[styles.checkbox, task.completed && styles.checkboxChecked]} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    padding: Spacing.md,
    paddingBottom: 34, // Safe area bottom
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 1.5,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  taskList: {
    gap: Spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    padding: Spacing.md,
    borderRadius: 12,
  },
  taskIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
  },
  taskInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  taskType: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  taskNotes: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    marginLeft: Spacing.md,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
}); 