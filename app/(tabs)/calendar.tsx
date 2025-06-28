import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { DayTasksSheet } from '@/components/calendar/DayTasksSheet';
import { useCalendarTasks } from '@/hooks/useCalendarTasks';
import { useLogCareAction } from '@/hooks/useLogCareAction';
import { useAuth } from '@/hooks/useAuth';
import { CareReminder } from '@/types/Plant';
import { scheduleAllTaskNotifications } from '@/notifications/scheduler';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';

type MarkedDates = {
  [date: string]: {
    dots?: Array<{
      key: string;
      color: string;
    }>;
    marked?: boolean;
    selected?: boolean;
    selectedColor?: string;
  };
};

export default function CalendarScreen() {
  const { user } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  
  // State
  const [currentMonth, setCurrentMonth] = useState(dayjs().format('YYYY-MM'));
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<CareReminder[]>([]);
  
  // Calculate start and end dates for the current month view
  const startDate = dayjs(currentMonth).startOf('month').subtract(7, 'day').format('YYYY-MM-DD');
  const endDate = dayjs(currentMonth).endOf('month').add(7, 'day').format('YYYY-MM-DD');
  
  // Fetch tasks
  const { tasks, isLoading, error, refetch } = useCalendarTasks(startDate, endDate);
  const logCareAction = useLogCareAction();

  // Schedule notifications for upcoming tasks
  useEffect(() => {
    if (!isLoading && tasks) {
      const allTasks = Object.values(tasks).flat();
      const upcomingTasks = allTasks.filter(task => {
        // Only schedule notifications for tasks within the next 30 days
        const dueDate = dayjs(task.due_date);
        const now = dayjs();
        return !task.completed && dueDate.isAfter(now) && dueDate.diff(now, 'days') <= 30;
      });
      
      // Schedule notifications for upcoming tasks
      scheduleAllTaskNotifications(upcomingTasks);
    }
  }, [isLoading, tasks]);

  // Generate marked dates for the calendar
  const markedDates: MarkedDates = {};
  
  if (tasks) {
    Object.entries(tasks).forEach(([date, dateTasks]) => {
      // Skip dates with no tasks
      if (!dateTasks || dateTasks.length === 0) return;
      
      // Create dots for each task
      const dots = dateTasks.map(task => {
        let color = Colors.primary; // Default color
        
        // Set color based on task type
        if (task.type === 'watering') {
          color = Colors.primary;
        } else if (task.type === 'fertilizing') {
          color = Colors.accent;
        } else if (task.type === 'harvesting') {
          color = Colors.warning;
        }
        
        return {
          key: task.id,
          color: task.completed ? Colors.success : color,
        };
      });
      
      markedDates[date] = {
        dots,
        selected: date === selectedDate,
        selectedColor: Colors.primary,
      };
    });
  }

  // Handle day press
  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    const dateTasks = tasks[day.dateString] || [];
    setSelectedTasks(dateTasks);
    
    if (dateTasks.length > 0) {
      bottomSheetRef.current?.present();
    }
  }, [tasks]);

  // Handle task completion
  const handleTaskComplete = useCallback((taskId: string) => {
    const task = selectedTasks.find(t => t.id === taskId);
    if (!task) return;
    
    console.log('🔥 Selected task for completion:', task);
    
    // If task is already completed, uncomplete it
    if (task.completed) {
      logCareAction.mutate({
        taskId,
        userPlantId: task.user_plant_id,
        actionType: task.type === 'watering' ? 'water' : task.type === 'fertilizing' ? 'fertilize' : 'harvest',
        uncomplete: true
      }, {
        onSuccess: (data) => {
          showToast(`Task uncompleted (${data.eco_points_delta} eco points)`, 'success');
          
          // Update local state
          setSelectedTasks(prev => 
            prev.map(t => 
              t.id === taskId 
                ? { ...t, completed: false }
                : t
            )
          );
          
          // Trigger haptic feedback
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          // Refetch tasks to update calendar
          refetch();
        }
      });
    } else {
      // Map task type to action type
      const actionType = task.type === 'watering' 
        ? 'water' 
        : task.type === 'fertilizing' 
          ? 'fertilize' 
          : 'harvest';
      
      // Set default amounts based on action type
      const defaultAmount = actionType === 'water' 
        ? 250  // 250ml for watering
        : actionType === 'fertilize'
          ? 10   // 10g for fertilizing
          : 100; // 100g for harvesting
      
      logCareAction.mutate({
        taskId,
        userPlantId: task.user_plant_id,
        actionType,
        amount: defaultAmount
      }, {
        onSuccess: (data) => {
          showToast(`Task completed (+${data.eco_points_delta} eco points)`, 'success');
          
          // Update local state
          setSelectedTasks(prev => 
            prev.map(t => 
              t.id === taskId 
                ? { ...t, completed: true }
                : t
            )
          );
          
          // Trigger haptic feedback
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          // Refetch tasks to update calendar
          refetch();
        }
      });
    }
  }, [selectedTasks, logCareAction, refetch]);

  // Handle month change (both swipe and buttons)
  const handleMonthChange = useCallback((month: string) => {
    setCurrentMonth(month);
  }, []);

  // Navigate to previous month
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = dayjs(currentMonth).subtract(1, 'month').format('YYYY-MM');
    handleMonthChange(prevMonth);
  }, [currentMonth, handleMonthChange]);

  // Navigate to next month
  const goToNextMonth = useCallback(() => {
    const nextMonth = dayjs(currentMonth).add(1, 'month').format('YYYY-MM');
    handleMonthChange(nextMonth);
  }, [currentMonth, handleMonthChange]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Care Calendar</Text>
        <Text style={styles.subtitle}>Track and manage your plant care schedule</Text>
      </View>
      
      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <Calendar
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={'multi-dot'}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: Colors.textPrimary,
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: Colors.white,
              todayTextColor: Colors.primary,
              dayTextColor: Colors.textPrimary,
              textDisabledColor: Colors.textMuted,
              dotColor: Colors.primary,
              selectedDotColor: Colors.white,
              arrowColor: Colors.primary,
              monthTextColor: Colors.textPrimary,
              indicatorColor: Colors.primary,
              textDayFontFamily: 'Inter-Regular',
              textMonthFontFamily: 'Inter-SemiBold',
              textDayHeaderFontFamily: 'Inter-Regular',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            enableSwipeMonths={true}
            current={currentMonth}
            onMonthChange={(month) => {
              handleMonthChange(`${month.year}-${String(month.month).padStart(2, '0')}`);
            }}
          />
        )}
      </View>
      
      {/* Tasks Bottom Sheet */}
      <DayTasksSheet
        bottomSheetRef={bottomSheetRef}
        tasks={selectedTasks}
        onTaskComplete={handleTaskComplete}
        date={selectedDate}
      />
      
      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  navButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  monthTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: Spacing.sm,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});