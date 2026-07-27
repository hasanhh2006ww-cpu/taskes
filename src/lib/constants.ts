import type { Priority, HabitType, WeeklyFrequency, MonthPeriod, UserTimezone, Habit, WeeklyHabit, MonthlyHabit } from './types';

export const PRIORITIES: { label: string; value: Priority; color: string }[] = [
  { label: 'منخفض', value: 'low', color: 'bg-blue-400/20 text-blue-400' },
  { label: 'متوسط', value: 'medium', color: 'bg-amber-400/20 text-amber-400' },
  { label: 'عالي', value: 'high', color: 'bg-rose-400/20 text-rose-400' },
];

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export const STORAGE_KEYS = {
  TASKS: 'my-taske-tasks',
  PROJECTS: 'my-taske-projects',
  UI: 'my-taske-ui',
  FOCUS_SESSION: 'my-taske-focus-session',
  FOCUS_SETTINGS: 'my-taske-focus-settings',
  HABITS: 'my-taske-habits',
  USER_TIMEZONE: 'my-taske-user-timezone',
  NOTIFICATION_SETTINGS: 'my-taske-notification-settings',
  FOCUS_DURATION: 'my-taske-focus-duration',
  EXPANDED_TASKS: 'my-taske-expanded-tasks',
} as const;

export const DEMO_EMAIL = 'demo@stilldo.app';
export const DEMO_PASSWORD = 'Demo@StillDo2024';

export const FOCUS_PRESETS = [
  { label: '25 / 5', work: 25, break: 5 },
  { label: '50 / 10', work: 50, break: 10 },
  { label: '90 / 20', work: 90, break: 20 },
] as const;

export const WEEKLY_FREQUENCIES: { value: WeeklyFrequency; label: string }[] = [
  { value: 1, label: 'مرة واحدة في الأسبوع' },
  { value: 2, label: 'مرتين في الأسبوع' },
  { value: 3, label: '3 مرات في الأسبوع' },
  { value: 4, label: '4 مرات في الأسبوع' },
  { value: 5, label: '5 مرات في الأسبوع' },
];

export const MONTH_PERIODS: { value: MonthPeriod; label: string }[] = [
  { value: 'start', label: 'الأسبوع الأول' },
  { value: 'middle', label: 'الأسبوع الثاني' },
  { value: 'end', label: 'الأسبوع الثالث' },
];

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDayOfWeek(date: string): number {
  return new Date(date).getDay();
}

export function getWeekNumber(date: string): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + 4) / 7);
}

export function getWeekKey(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week}`;
}

export function isToday(date: string): boolean {
  return date === getToday();
}

export function getDayLabel(date: string): string {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return days[new Date(date).getDay()];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
}

export function getCurrentWeekKey(): string {
  return getWeekKey(getToday());
}

export function getMonthWeekKey(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}-W${getWeekNumber(date)}`; // First 4 weeks
}

export function isWeeklyHabitCompleted(habit: WeeklyHabit, date: string): boolean {
  const weekKey = getWeekKey(date);
  return habit.completedWeeks[weekKey] === true;
}

export function updateWeeklyHabitCompletion(habit: WeeklyHabit, date: string, completed: boolean): WeeklyHabit {
  const weekKey = getWeekKey(date);
  const completedWeeks = { ...habit.completedWeeks, [weekKey]: completed };
  return { ...habit, completedWeeks };
}

export function calculateWeeklyStreak(habit: WeeklyHabit, currentDate: string): number {
  const weekKey = getWeekKey(currentDate);
  if (!habit.completedWeeks[weekKey]) return 0;

  let streak = 1;
  let cursor = new Date(currentDate);
  for (;;) {
    cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekKey = getWeekKey(cursor.toISOString().split('T')[0]);
    if (habit.completedWeeks[prevWeekKey]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function isMonthlyHabitCompleted(habit: MonthlyHabit, date: string): boolean {
  const weekKey = getMonthWeekKey(date);
  return (habit.completedDays[weekKey] || 0) >= 1;
}

export function updateMonthlyHabitCompletion(habit: MonthlyHabit, date: string, completed: boolean): MonthlyHabit {
  const weekKey = getMonthWeekKey(date);
  const currentCount = habit.completedDays[weekKey] || 0;
  const newCount = completed ? currentCount + 1 : Math.max(0, currentCount - 1);
  const completedDays = { ...habit.completedDays, [weekKey]: newCount };
  return { ...habit, completedDays };
}

export function calculateMonthlyStreak(habit: MonthlyHabit, currentDate: string): number {
  const weekKey = getMonthWeekKey(currentDate);
  if (!habit.completedDays[weekKey] || habit.completedDays[weekKey] < 1) return 0;

  let streak = 1;
  let cursor = new Date(currentDate);
  for (;;) {
    cursor = new Date(cursor.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekKey = getMonthWeekKey(cursor.toISOString().split('T')[0]);
    if (habit.completedDays[prevWeekKey] && habit.completedDays[prevWeekKey] >= 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
