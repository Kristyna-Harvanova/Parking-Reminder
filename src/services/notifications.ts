import * as Notifications from 'expo-notifications';
import { ParkingSession } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleExpiryReminder(session: ParkingSession): Promise<string | null> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const expiryTime = new Date(session.startTime).getTime() + session.duration * 60 * 1000;
    const reminderTime = expiryTime - session.reminderBefore * 60 * 1000;
    const secondsUntilReminder = Math.max(0, (reminderTime - Date.now()) / 1000);

    if (secondsUntilReminder <= 0) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Parking Expiring Soon!',
        body: `Your parking expires in ${session.reminderBefore} minutes. Time to head back!`,
        data: { sessionId: session.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.round(secondsUntilReminder),
      },
    });

    return id;
  },

  async cancelReminder(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async sendArrivalNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'You reached your car!',
        body: 'Parking session cleared. Drive safe!',
      },
      trigger: null,
    });
  },
};
