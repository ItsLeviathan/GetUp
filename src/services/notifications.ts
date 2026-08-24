import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { granted } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      bypassDnd: true,
    });
  }

  return granted;
}

export async function scheduleAlarm(alarm: Alarm): Promise<void> {
  await cancelAlarmNotifications(alarm.id);
  if (!alarm.enabled || !alarm.days.length) return;

  const [hours, minutes] = alarm.time.split(':').map(Number);

  for (const day of alarm.days) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 GetUp — Mission Time',
        body: `${alarm.label || 'Wake up!'} · Bathroom Roulette awaits`,
        sound: true,
        data: { alarmId: alarm.id, type: 'alarm' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: day + 1,
        hour: hours,
        minute: minutes,
        channelId: Platform.OS === 'android' ? 'alarms' : undefined,
      },
    });
  }
}

export async function cancelAlarmNotifications(alarmId: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.content.data?.alarmId === alarmId)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}