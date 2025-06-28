import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { Droplets, Zap, Scissors } from 'lucide-react-native';
import { CareReminder } from '@/types/Plant';

interface DayTasksSheetProps {
  tasks: CareReminder[];
  onTaskComplete: (taskId: string) => void;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

export function DayTasksSheet({ tasks, onTaskComplete, bottomSheetRef }: DayTasksSheetProps) {
  // Variables
  const snapPoints = useMemo(() => ['50%'], []);

  // Callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

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

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Tasks for Today</Text>
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
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    flex: 1,
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
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgLight,
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