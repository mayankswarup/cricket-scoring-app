import { useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import * as Notifications from 'expo-notifications';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Request permissions on mount
    const setupNotifications = async () => {
      try {
        const granted = await notificationService.requestPermissions();
        setPermissionGranted(granted);
      } catch (error) {
        console.error('Error setting up notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setupNotifications();

    // Setup listeners
    notificationService.setupNotificationListeners(
      (notification) => {
        console.log('Notification received in foreground:', notification);
      },
      (response) => {
        console.log('User tapped notification:', response);
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        console.log('Notification data:', data);
      }
    );

    // Cleanup listeners on unmount
    return () => {
      notificationService.removeNotificationListeners();
    };
  }, []);

  return {
    permissionGranted,
    isLoading,
    showNotification: notificationService.showNotification.bind(notificationService),
    scheduleNotification: notificationService.scheduleNotification.bind(notificationService),
    cancelNotification: notificationService.cancelNotification.bind(notificationService),
    cancelAllNotifications: notificationService.cancelAllNotifications.bind(notificationService),
    // Cricket-specific helpers
    notifyWicket: notificationService.notifyWicket.bind(notificationService),
    notifyBoundary: notificationService.notifyBoundary.bind(notificationService),
    notifyOverComplete: notificationService.notifyOverComplete.bind(notificationService),
    notifyMilestone: notificationService.notifyMilestone.bind(notificationService),
    notifyInningsComplete: notificationService.notifyInningsComplete.bind(notificationService),
    notifyMatchStart: notificationService.notifyMatchStart.bind(notificationService),
    notifyMatchResult: notificationService.notifyMatchResult.bind(notificationService),
  };
};

