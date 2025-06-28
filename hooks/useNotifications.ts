import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { requestNotificationPermissions } from '@/notifications/scheduler';

const NOTIFICATIONS_ENABLED_KEY = '@GrowEasy:notificationsEnabled';

export function useNotifications() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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