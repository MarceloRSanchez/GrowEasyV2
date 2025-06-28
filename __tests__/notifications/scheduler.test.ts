import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  scheduleTaskNotification,
  cancelTaskNotification,
  cancelAllTaskNotifications,
  scheduleAllTaskNotifications,
  areNotificationsEnabled,
  setNotificationsEnabled,
  requestNotificationPermissions
} from '@/notifications/scheduler';
import { CareReminder } from '@/types/Plant';

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('Notification Scheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id-123');
  });

  describe('areNotificationsEnabled', () => {
    it('should return true when notifications are enabled', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');
      
      const result = await areNotificationsEnabled();
      
      expect(result).toBe(true);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@GrowEasy:notificationsEnabled');
    });

    it('should return false when notifications are disabled', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
      
      const result = await areNotificationsEnabled();
      
      expect(result).toBe(false);
    });

    it('should return false when storage error occurs', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await areNotificationsEnabled();
      
      expect(result).toBe(false);
    });
  });

  describe('requestNotificationPermissions', () => {
    it('should return true when permissions are already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      
      const result = await requestNotificationPermissions();
      
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permissions when not already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
      
      const result = await requestNotificationPermissions();
      
      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permissions are denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      
      const result = await requestNotificationPermissions();
      
      expect(result).toBe(false);
    });
  });

  describe('scheduleTaskNotification', () => {
    const mockTask: CareReminder = {
      id: 'task-123',
      user_plant_id: 'plant-456',
      type: 'watering',
      due_date: '2025-07-01',
      completed: false,
      notes: 'Water the basil plant'
    };

    it('should schedule a notification for a task', async () => {
      const result = await scheduleTaskNotification(mockTask);
      
      expect(result).toBe('notification-id-123');
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Time to water your plant!',
          body: 'Water the basil plant',
          data: { taskId: 'task-123', userPlantId: 'plant-456' },
        },
        trigger: expect.any(Object),
      });
    });

    it('should not schedule if notifications are disabled', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
      
      const result = await scheduleTaskNotification(mockTask);
      
      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should not schedule if permissions are not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      
      const result = await scheduleTaskNotification(mockTask);
      
      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should not schedule if due date is in the past', async () => {
      const pastTask = {
        ...mockTask,
        due_date: '2020-01-01'
      };
      
      const result = await scheduleTaskNotification(pastTask);
      
      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(new Error('Scheduling error'));
      
      const result = await scheduleTaskNotification(mockTask);
      
      expect(result).toBeNull();
    });
  });

  describe('cancelTaskNotification', () => {
    it('should cancel a notification by ID', async () => {
      await cancelTaskNotification('notification-id-123');
      
      expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id-123');
    });

    it('should handle errors gracefully', async () => {
      (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValue(new Error('Cancel error'));
      
      await expect(cancelTaskNotification('notification-id-123')).resolves.not.toThrow();
    });
  });

  describe('cancelAllTaskNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      await cancelAllTaskNotifications();
      
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(new Error('Cancel all error'));
      
      await expect(cancelAllTaskNotifications()).resolves.not.toThrow();
    });
  });

  describe('scheduleAllTaskNotifications', () => {
    const mockTasks: CareReminder[] = [
      {
        id: 'task-1',
        user_plant_id: 'plant-1',
        type: 'watering',
        due_date: '2025-07-01',
        completed: false,
        notes: 'Water the basil'
      },
      {
        id: 'task-2',
        user_plant_id: 'plant-2',
        type: 'fertilizing',
        due_date: '2025-07-02',
        completed: false,
        notes: 'Fertilize the tomato'
      },
      {
        id: 'task-3',
        user_plant_id: 'plant-3',
        type: 'watering',
        due_date: '2025-07-03',
        completed: true, // Already completed, should not be scheduled
        notes: 'Water the mint'
      }
    ];

    it('should schedule notifications for all incomplete tasks', async () => {
      const result = await scheduleAllTaskNotifications(mockTasks);
      
      expect(result.size).toBe(2); // Only 2 incomplete tasks
      expect(result.get('task-1')).toBe('notification-id-123');
      expect(result.get('task-2')).toBe('notification-id-123');
      expect(result.has('task-3')).toBe(false); // Completed task should not be scheduled
      
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    });

    it('should not schedule any notifications if disabled', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('false');
      
      const result = await scheduleAllTaskNotifications(mockTasks);
      
      expect(result.size).toBe(0);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should not schedule any notifications if permissions denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
      
      const result = await scheduleAllTaskNotifications(mockTasks);
      
      expect(result.size).toBe(0);
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('setNotificationsEnabled', () => {
    it('should save enabled state to storage', async () => {
      await setNotificationsEnabled(true);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@GrowEasy:notificationsEnabled', 'true');
      expect(Notifications.cancelAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    });

    it('should cancel all notifications when disabled', async () => {
      await setNotificationsEnabled(false);
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@GrowEasy:notificationsEnabled', 'false');
      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle storage errors gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      await expect(setNotificationsEnabled(true)).resolves.not.toThrow();
    });
  });
});