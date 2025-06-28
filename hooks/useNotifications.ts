import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  requestNotificationPermissions, 
  setNotificationsEnabled as setNotificationsEnabledInStorage,
  scheduleAllTaskNotifications,
  cancelAllTaskNotifications
} from '@/notifications/scheduler';
import { useCalendarTasks } from './useCalendarTasks';
import dayjs from 'dayjs';

const NOTIFICATIONS_ENABLED_KEY = '@GrowEasy:notificationsEnabled';

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get tasks for the next 30 days to schedule notifications
  const startDate = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().add(30, 'days').format('YYYY-MM-DD');
  const { tasks } = useCalendarTasks(startDate, endDate);

  // Load notification preferences on mount
  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const storedValue = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      setIsEnabled(storedValue === 'true');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
      setIsLoading(false);
    }
  };

  const toggleNotifications = async () => {
    try {
      // If enabling notifications, request permissions first
      if (!isEnabled && Platform.OS !== 'web') {
        const permissionsGranted = await requestNotificationPermissions(); 
        if (!permissionsGranted) {
          console.log('Notification permissions denied');
          return;
        }
      }

      const newValue = !isEnabled;
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, newValue.toString());
      
      // Update notifications in storage
      await setNotificationsEnabledInStorage(newValue);
      
      // Schedule or cancel notifications based on new value
      if (newValue && tasks) {
        // Schedule notifications for all upcoming tasks
        const allTasks = Object.values(tasks).flat();
        await scheduleAllTaskNotifications(allTasks);
      } else {
        // Cancel all scheduled notifications
        await cancelAllTaskNotifications();
      }
      
      setIsEnabled(newValue);

      // Log analytics event
      console.log('Analytics: notifications_toggled', { enabled: newValue });
    } catch (error) {
      console.error('Failed to toggle notifications:', error);
    }
  };

  return {
    isEnabled,
    isLoading,
    toggleNotifications,
  };
}