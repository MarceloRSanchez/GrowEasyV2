import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { DayTasksCard } from '@/components/calendar/DayTasksCard';
import { CareReminder } from '@/types/Plant';

// Temporary mock data
const mockTasks: { [date: string]: CareReminder[] } = {
  '2025-06-20': [
    {
      id: '1',
      userPlantId: '1',
      type: 'watering',
      dueDate: '2025-06-20',
      completed: false,
      notes: 'Water the basil plant'
    },
    {
      id: '2',
      userPlantId: '2',
      type: 'fertilizing',
      dueDate: '2025-06-20',
      completed: false,
      notes: 'Fertilize the tomato plant'
    }
  ],
  '2025-06-22': [
    {
      id: '3',
      userPlantId: '3',
      type: 'harvesting',
      dueDate: '2025-03-22',
      completed: false,
      notes: 'Harvest the lettuce'
    }
  ]
};

export default function CalendarScreen() {
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<CareReminder[]>([]);
  const [isCardVisible, setCardVisible] = useState(false);

  // Generate marked dates for the calendar
  const markedDates = Object.entries(mockTasks).reduce((acc, [date, tasks]) => {
    const dots = tasks.map(task => ({
      key: task.id,
      color: task.type === 'watering' ? Colors.primary :
             task.type === 'fertilizing' ? '#7ED321' :
             '#F5A623'
    }));

    acc[date] = {
      dots,
      marked: true
    };

    if (date === selectedDate) {
      acc[date].selected = true;
    }

    return acc;
  }, {} as any);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    const tasks = mockTasks[day.dateString] || [];
    setSelectedTasks(tasks);
    setCardVisible(true);
  }, []);

  const handleTaskComplete = useCallback((taskId: string) => {
    setSelectedTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      )
    );
  }, []);

  const handleCloseCard = useCallback(() => {
    setCardVisible(false);
  }, []);

  // Simplified structure for testing
  return (
    <View style={{ flex: 1, backgroundColor: Colors.bgLight }}>
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType={'multi-dot'}
        style={{
          marginTop: 50 // Simple margin to avoid status bar
        }}
      />

      <DayTasksCard
        tasks={selectedTasks}
        onTaskComplete={handleTaskComplete}
        onClose={handleCloseCard}
        visible={isCardVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  calendarContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }
}); 