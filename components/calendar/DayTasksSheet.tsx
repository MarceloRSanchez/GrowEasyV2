import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { Droplets, Zap, Scissors, Check, X } from 'lucide-react-native';
import { CareReminder } from '@/types/Plant';
import dayjs from 'dayjs';

interface DayTasksSheetProps {
  tasks: CareReminder[];
  onTaskComplete: (taskId: string) => void;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  date: string;
}

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 40;
const SPRING_CONFIG = { damping: 20, stiffness: 300, mass: 0.5 };

// Moved getIcon function outside of components
function getIcon(type: CareReminder['type']) {
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
}

export function DayTasksSheet({ tasks, onTaskComplete, bottomSheetRef, date }: DayTasksSheetProps) {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Tasks';
    
    const date = dayjs(dateString);
    const today = dayjs();
    const tomorrow = dayjs().add(1, 'day');
    
    // Compare full dates including year
    if (date.format('YYYY-MM-DD') === today.format('YYYY-MM-DD')) {
      return 'Today';
    } else if (date.format('YYYY-MM-DD') === tomorrow.format('YYYY-MM-DD')) {
      return 'Tomorrow';
    } else {
      return date.format('MMMM D, YYYY');
    }
  };

  // Sort tasks by completion status and due date
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      // Sort by completion status first
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      
      // Then sort by due date
      return dayjs(a.due_date).diff(dayjs(b.due_date));
    });
  }, [tasks]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {date ? formatDate(date) : 'Tasks'}
          </Text>
          <Text style={styles.subtitle}>
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} scheduled
          </Text>
        </View>
        
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks for this day</Text>
          </View>
        ) : (
          <View style={styles.taskList}>
            {sortedTasks.map((task) => (
              <SwipeableTaskItem
                key={task.id}
                task={task}
                onComplete={onTaskComplete}
              />
            ))}
          </View>
        )}
      </View>
    </BottomSheetModal>
  );
}

interface SwipeableTaskItemProps {
  task: CareReminder;
  onComplete: (taskId: string) => void;
}

function SwipeableTaskItem({ task, onComplete }: SwipeableTaskItemProps) {
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onStart(() => {
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      // Only allow swiping left (negative values)
      translateX.value = Math.min(0, startX.value + e.translationX);
    })
    .onEnd((e) => {
      if (translateX.value < -SWIPE_THRESHOLD) {
        // Swiped far enough to trigger action
        translateX.value = withSpring(-ACTION_WIDTH, SPRING_CONFIG);
        // Complete the task
        if (!task.completed) {
          runOnJS(onComplete)(task.id);
        }
      } else {
        // Reset position
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));
  
  const actionStyle = useAnimatedStyle(() => {
    const opacity = Math.min(1, Math.abs(translateX.value) / ACTION_WIDTH);
    return {
      opacity,
      right: 0,
    };
  });
  
  const getTaskStatusColor = (task: CareReminder) => {
    if (task.completed) {
      return Colors.success;
    }
    
    const dueDate = dayjs(task.due_date);
    const today = dayjs();
    
    if (dueDate.isBefore(today, 'day')) {
      return Colors.error; // Overdue
    } else if (dueDate.isSame(today, 'day')) {
      return Colors.primary; // Due today
    } else {
      return Colors.accent; // Upcoming
    }
  };

  return (
    <View style={styles.swipeContainer}>
      {/* Action button that appears when swiping */}
      <Reanimated.View style={[styles.actionButton, actionStyle]}>
        {task.completed ? (
          <X size={24} color={Colors.white} />
        ) : (
          <Check size={24} color={Colors.white} />
        )}
      </Reanimated.View>
      
      {/* Swipeable task item */}
      <GestureDetector gesture={panGesture}>
        <Reanimated.View style={[styles.taskItem, animatedStyle, task.completed && styles.completedTask]}>
          <View style={[styles.taskIcon, { backgroundColor: `${getTaskStatusColor(task)}20` }]}>
            {task.completed ? (
              <Check size={24} color={Colors.success} />
            ) : (
              getIcon(task.type)
            )}
          </View>
          
          <View style={styles.taskInfo}>
            <Text style={[styles.taskType, task.completed && styles.completedText]}>
              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
              {task.completed && ' (Completed)'}
            </Text>
            {task.notes && (
              <Text style={[styles.taskNotes, task.completed && styles.completedText]} numberOfLines={2}>
                {task.notes}
              </Text>
            )}
          </View>
          
          <TouchableOpacity 
            style={[styles.checkbox, task.completed && styles.checkboxChecked]}
            onPress={() => onComplete(task.id)}
            accessibilityLabel={`${task.type} task ${task.completed ? 'completed' : 'incomplete'}`}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.completed }}
            accessibilityHint={task.completed ? "Tap to mark task as incomplete" : "Tap to mark task as complete"}
          >
            {task.completed && <Check size={16} color={Colors.white} />}
          </TouchableOpacity>
        </Reanimated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 4,
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
  swipeContainer: {
    position: 'relative',
    height: 80,
  },
  actionButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    backgroundColor: Colors.success,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
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
    height: '100%',
    zIndex: 2,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: Colors.bgLight,
  },
  taskIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  completedText: {
    color: Colors.textMuted,
    textDecorationLine: 'line-through',
  },
});