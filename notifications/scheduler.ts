import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CareReminder } from '@/types/Plant';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * @returns Promise<boolean> - Whether permissions were granted
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Only ask if permissions have not already been determined
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

/**
 * Schedule a notification for a care task
 * @param task The care task to schedule a notification for
 * @returns Promise<string> - The notification identifier
 */
export async function scheduleTaskNotification(task: CareReminder): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return null;
  }

  // Check if permissions are granted
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return null;
  }

  try {
    // Parse the due date
    const dueDate = new Date(task.due_date);
    
    // Set notification time to 9:00 AM on the due date
    dueDate.setHours(9, 0, 0, 0);
    
    // Don't schedule if the time is in the past
    if (dueDate.getTime() < Date.now()) {
      console.log('Task due date is in the past, not scheduling notification');
      return null;
    }

    // Create a title based on the task type
    const title = `Time to ${task.type.replace('ing', '')} your plant!`;
    const body = task.notes || `Don't forget to ${task.type.replace('ing', '')} your plant today.`;

    // Schedule the notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { taskId: task.id, userPlantId: task.user_plant_id },
      },
      trigger: {
        date: dueDate,
      },
    });

    // Log analytics
    console.log('Analytics: notification_scheduled', {
      taskId: task.id,
      taskType: task.type,
      scheduledFor: dueDate.toISOString(),
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

/**
 * Cancel a scheduled notification
 * @param identifier The notification identifier to cancel
 */
export async function cancelTaskNotification(identifier: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    console.log('Notification canceled:', identifier);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllTaskNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Schedule notifications for all tasks
 * @param tasks The tasks to schedule notifications for
 * @returns Promise<Map<string, string>> - A map of task IDs to notification identifiers
 */
export async function scheduleAllTaskNotifications(
  tasks: CareReminder[]
): Promise<Map<string, string>> {
  const notificationMap = new Map<string, string>();

  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return notificationMap;
  }

  // Check if permissions are granted
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log('Notification permissions not granted');
    return notificationMap;
  }

  // Schedule notifications for each task
  for (const task of tasks) {
    if (!task.completed) {
      const identifier = await scheduleTaskNotification(task);
      if (identifier) {
        notificationMap.set(task.id, identifier);
      }
    }
  }

  return notificationMap;
}