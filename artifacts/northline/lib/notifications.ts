import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const REMINDER_CHANNEL = "northline-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL, {
    name: "Logging reminders",
    description: "Quiet nudges to capture what just happened.",
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility:
      Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: "default",
    vibrationPattern: [0, 200, 200, 200],
  });
}

export async function requestPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: false,
    },
  });
  return req.granted;
}

export async function cancelReminders(): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

export async function scheduleReminders(
  intervalMinutes: number,
): Promise<void> {
  if (Platform.OS === "web") return;
  await ensureAndroidChannel();
  await cancelReminders();
  const seconds = Math.max(60, Math.floor(intervalMinutes * 60));
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Northline",
      body: `What did the last ${intervalMinutes} minutes hold?`,
      sound: "default",
      ...(Platform.OS === "android"
        ? { channelId: REMINDER_CHANNEL }
        : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: true,
      ...(Platform.OS === "android"
        ? { channelId: REMINDER_CHANNEL }
        : {}),
    },
  });
}

export async function sendTestNotification(): Promise<void> {
  if (Platform.OS === "web") return;
  await ensureAndroidChannel();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Northline",
      body: "This is what a reminder looks like.",
      sound: "default",
      ...(Platform.OS === "android"
        ? { channelId: REMINDER_CHANNEL }
        : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
      ...(Platform.OS === "android"
        ? { channelId: REMINDER_CHANNEL }
        : {}),
    },
  });
}
