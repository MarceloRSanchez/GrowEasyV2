import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Colors, Typography, Spacing } from '@/constants/Colors';
import { DayTasksSheet } from '@/components/calendar/DayTasksSheet';
import { CareReminder } from '@/types/Plant';

// Temporary mock data
const mockTasks: { [date: string]: CareReminder[] } = {
  '2025-03-20': [
    {
      id: '1',
      userPlantId: '1',
      type: 'watering',
      dueDate: '2025-03-20',
      completed: false,
      notes: 'Water the basil plant'
    },
    {
      id: '2',
      userPlantId: '2',
      type: 'fertilizing',
      dueDate: '2025-03-20',
      completed: false,
      notes: 'Fertilize the tomato plant'
    }
  ],
  '2025-03-22': [
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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

  const handleDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
    setSelectedTasks(mockTasks[day.dateString] || []);
    bottomSheetRef.current?.present();
  };

  const handleTaskComplete = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: true }
          : task
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.calendarContainer}>
        <Calendar
          initialDate={new Date().toISOString().split('T')[0]}
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={handleDayPress}
          onDayLongPress={(day: DateData) => {
            console.log('selected day', day);
          }}
          monthFormat={'MMMM yyyy'}
          onMonthChange={(month: DateData) => {
            console.log('month changed', month);
          }}
          hideArrows={false}
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={1}
          enableSwipeMonths={true}
          theme={{
            backgroundColor: Colors.white,
            calendarBackground: Colors.white,
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
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13
          }}
          markingType={'multi-dot'}
          markedDates={markedDates}
        />
      </View>

      <DayTasksSheet
        tasks={selectedTasks}
        onTaskComplete={handleTaskComplete}
        bottomSheetRef={bottomSheetRef}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
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