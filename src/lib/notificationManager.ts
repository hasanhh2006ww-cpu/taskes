
// notificationManager.ts

import type { Habit, DailyHabit, WeeklyHabit, MonthlyHabit } from "./types";
import { loadFromStorage, saveToStorage } from "./storage";
import { STORAGE_KEYS, getToday, getWeekKey, getMonthWeekKey } from "./constants";

interface NotificationSettings {
  dailyReminder: {
    enabled: boolean;
    time: string; // "HH:mm" format
  };
  streakWarning: {
    enabled: boolean;
  };
  permissionGranted: boolean;
}

const defaultNotificationSettings: NotificationSettings = {
  dailyReminder: {
    enabled: false,
    time: "21:00", // Default 9 PM
  },
  streakWarning: {
    enabled: true,
  },
  permissionGranted: false,
};

let notificationInterval: NodeJS.Timeout | null = null;

export const getNotificationSettings = (): NotificationSettings => {
  return loadFromStorage<NotificationSettings>(
    STORAGE_KEYS.NOTIFICATION_SETTINGS,
    defaultNotificationSettings
  );
};

export const saveNotificationSettings = (settings: NotificationSettings) => {
  saveToStorage(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.warn("This browser does not support desktop notification");
    return false;
  }

  const settings = getNotificationSettings();

  if (Notification.permission === "granted") {
    settings.permissionGranted = true;
    saveNotificationSettings(settings);
    return true;
  }

  if (Notification.permission === "denied") {
    settings.permissionGranted = false;
    saveNotificationSettings(settings);
    return false;
  }

  // Request permission
  const permission = await Notification.requestPermission();
  settings.permissionGranted = permission === "granted";
  saveNotificationSettings(settings);
  return permission === "granted";
};

export const showNotification = (title: string, body: string, onClick?: () => void) => {
  const settings = getNotificationSettings();
  if (settings.permissionGranted && Notification.permission === "granted") {
    const notification = new Notification(title, { body });
    if (onClick) {
      notification.onclick = onClick;
    }
    return notification;
  }
  return null;
};

export const checkAndSendDailyReminder = (timezone: string) => {
  const settings = getNotificationSettings();
  if (!settings.dailyReminder.enabled || !settings.permissionGranted) {
    return;
  }

  const now = new Date();
  const [hour, minute] = settings.dailyReminder.time.split(":").map(Number);

  // Using Intl.DateTimeFormat to get local time components based on the specified timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23", // 24-hour format
    timeZone: timezone,
  });

  const formattedTime = formatter.format(now);
  const [currentHourStr, currentMinuteStr] = formattedTime.split(":");
  const currentHour = parseInt(currentHourStr);
  const currentMinute = parseInt(currentMinuteStr);

  // Check if it's the chosen time (within a minute tolerance to avoid missing)
  if (
    currentHour === hour &&
    currentMinute === minute &&
    now.getSeconds() < 30 // Send once within the first 30 seconds of the minute
  ) {
    showNotification(
      "My Task - تذكير العادة",
      "لا تكسر الستريك! أكمل عاداتك اليوم 🔥",
      () => {
        // Logic to open app and highlight uncompleted habits
        // This might involve sending a message to the main app thread or opening a specific URL
        // For now, we'll just focus the window
        window.focus();
      }
    );
  }
};

// This will be called from useHabitStore or a similar place
export const checkAndSendStreakWarning = (
  habits: Habit[],
  timezone: string
) => {
  const settings = getNotificationSettings();
  if (!settings.streakWarning.enabled || !settings.permissionGranted) {
    return;
  }

  const now = new Date();
  const dayOfWeek = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: timezone,
  }).format(now);
  const dayOfMonth = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    timeZone: timezone,
  }).format(now);
  const hourInTimezone = parseInt(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hourCycle: "h23",
      timeZone: timezone,
    }).format(now)
  );

  function getLocal(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function setLocal(key: string, val: string): void {
    try { localStorage.setItem(key, val); } catch { /* ignore */ }
  }

  habits.forEach((habit) => {
    if (habit.type === "daily") {
      const dailyHabit = habit as DailyHabit;
      if (dailyHabit.completions[getToday()] !== true && hourInTimezone === 21) {
        const lastSentKey = `lastStreakWarning-${habit.id}-${now.toISOString().split('T')[0]}`;
        if (!getLocal(lastSentKey)) {
          showNotification(
            "⚠️ الستريك مهدد!",
            `لم تكمل ${habit.title} بعد. تبقى 3 ساعات لإنقاذ ستريكك!`,
          );
          setLocal(lastSentKey, "true");
        }
      }
    }

    if (habit.type === "weekly") {
      const weeklyHabit = habit as WeeklyHabit;
      const thisWeekKey = getWeekKey(getToday());
      // Warn Saturday 21:00 if week not yet completed
      const isSaturday = dayOfWeek === "Saturday" && hourInTimezone === 21;
      if (isSaturday && weeklyHabit.completedWeeks[thisWeekKey] !== true) {
        const lastSentKey = `lastWeeklyStreakWarning-${habit.id}-${now.toISOString().split('T')[0]}`;
        if (!getLocal(lastSentKey)) {
          showNotification(
            "⚠️ الستريك الأسبوعي مهدد!",
            `لم تكمل ${habit.title} بعد. تبقى يوم واحد لإنقاذ ستريكك الأسبوعي!`,
          );
          setLocal(lastSentKey, "true");
        }
      }
    }

    if (habit.type === "monthly") {
      const monthlyHabit = habit as MonthlyHabit;
      const thisMonthKey = getMonthWeekKey(getToday());
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysLeft = new Intl.DateTimeFormat("en-US", {
        day: "numeric", timeZone: timezone,
      }).format(lastDayOfMonth);
      const daysUntilMonthEnd = parseInt(daysLeft) - parseInt(dayOfMonth);

      if (daysUntilMonthEnd === 3 && hourInTimezone === 21 && (monthlyHabit.completedDays[thisMonthKey] || 0) < (monthlyHabit.targetCount || 1)) {
        const lastSentKey = `lastMonthlyStreakWarning-${habit.id}-${now.toISOString().split('T')[0]}`;
        if (!getLocal(lastSentKey)) {
          showNotification(
            "⚠️ الستريك الشهري مهدد!",
            `لم تكمل ${habit.title} بعد. تبقى 3 أيام لإنقاذ ستريكك الشهري!`,
          );
          setLocal(lastSentKey, "true");
        }
      }
    }
  });
};

export const startNotificationChecker = (
  getHabits: () => Habit[],
  timezone: string
) => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
  }

  // Check every hour
  notificationInterval = setInterval(() => {
    console.log("Checking for notifications...");
    checkAndSendDailyReminder(timezone);
    checkAndSendStreakWarning(getHabits(), timezone);
  }, 60 * 60 * 1000); // Every hour

  // Initial check on startup
  checkAndSendDailyReminder(timezone);
  checkAndSendStreakWarning(getHabits(), timezone);
};

export const stopNotificationChecker = () => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
  }
};
