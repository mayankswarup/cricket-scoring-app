import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private notificationListener: any;
  private responseListener: any;

  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('📱 Must use physical device for Push Notifications');
      return false;
    }

    try {
      // Check current permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('📱 Current notification status:', existingStatus);
      
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        console.log('📱 Requesting notification permissions...');
        
        // Request permissions with all options for iOS
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        
        finalStatus = status;
        console.log('📱 Permission request result:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permission denied. Status:', finalStatus);
        return false;
      }

      console.log('✅ Notification permissions granted!');
      
      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  }

  // Schedule a local notification immediately
  async showNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: null, // Show immediately
      });
      console.log('📬 Notification sent:', title);
    } catch (error) {
      console.error('❌ Error showing notification:', error);
    }
  }

  // Schedule a notification for later
  async scheduleNotification(
    title: string,
    body: string,
    seconds: number,
    data?: any
  ): Promise<string> {
    try {
      const trigger: Notifications.TimeIntervalTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
      };
      
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger,
      });
      console.log('⏰ Notification scheduled:', title, 'in', seconds, 'seconds');
      return id;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      throw error;
    }
  }

  // Cancel a scheduled notification
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('🚫 Notification cancelled:', notificationId);
    } catch (error) {
      console.error('❌ Error cancelling notification:', error);
    }
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('🚫 All notifications cancelled');
    } catch (error) {
      console.error('❌ Error cancelling all notifications:', error);
    }
  }

  // Cricket-specific notification helpers
  async notifyWicket(playerName: string, score: number, balls: number): Promise<void> {
    await this.showNotification(
      '🏏 Wicket!',
      `${playerName} is out for ${score} (${balls} balls)`,
      { type: 'wicket', player: playerName, score }
    );
  }

  async notifyBoundary(playerName: string, runs: number, isFirst: boolean = false): Promise<void> {
    const emoji = runs === 6 ? '🚀' : '⚡';
    const message = isFirst 
      ? `${playerName} hits ${runs === 6 ? 'a SIX' : 'a FOUR'}!`
      : `${playerName} scores ${runs} runs!`;
    
    await this.showNotification(
      `${emoji} ${runs === 6 ? 'SIX!' : 'FOUR!'}`,
      message,
      { type: 'boundary', player: playerName, runs }
    );
  }

  async notifyOverComplete(overNumber: number, runs: number, wickets: number): Promise<void> {
    await this.showNotification(
      `✅ Over ${overNumber} Complete`,
      `${runs} runs, ${wickets} wicket(s) in this over`,
      { type: 'over', overNumber, runs, wickets }
    );
  }

  async notifyMilestone(playerName: string, milestone: number): Promise<void> {
    const emoji = milestone >= 100 ? '💯' : '🎯';
    await this.showNotification(
      `${emoji} Milestone!`,
      `${playerName} reaches ${milestone}!`,
      { type: 'milestone', player: playerName, score: milestone }
    );
  }

  async notifyInningsComplete(team: string, score: number, wickets: number, overs: number): Promise<void> {
    await this.showNotification(
      '🏁 Innings Complete',
      `${team}: ${score}/${wickets} in ${overs} overs`,
      { type: 'innings', team, score, wickets, overs }
    );
  }

  async notifyMatchStart(team1: string, team2: string): Promise<void> {
    await this.showNotification(
      '🏏 Match Starting!',
      `${team1} vs ${team2}`,
      { type: 'match_start', team1, team2 }
    );
  }

  async notifyMatchResult(winner: string, margin: string): Promise<void> {
    await this.showNotification(
      '🏆 Match Result',
      `${winner} wins by ${margin}`,
      { type: 'match_result', winner, margin }
    );
  }

  // Set up listeners for when user taps on notification
  setupNotificationListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener for when notification is received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listener for when user taps on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        if (onNotificationTapped) {
          onNotificationTapped(response);
        }
      }
    );
  }

  // Clean up listeners
  removeNotificationListeners(): void {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }
}

export const notificationService = new NotificationService();

