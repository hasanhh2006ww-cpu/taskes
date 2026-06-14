export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'all' | 'today' | 'important' | 'completed';

export type HabitType = 'daily' | 'weekly' | 'monthly';

export type WeeklyFrequency = 1 | 2 | 3 | 4 | 5;

export type MonthPeriod = 'start' | 'middle' | 'end';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  completed: boolean;
  projectId?: string;
  createdAt: number;
  order: number;
  important: boolean;
  pomodoroCount: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface DailyHabit {
  id: string;
  title: string;
  type: 'daily';
  createdAt: number;
  order: number;
  completions: Record<string, boolean>;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}

export interface WeeklyHabit {
  id: string;
  title: string;
  type: 'weekly';
  frequency: WeeklyFrequency;
  daysOfWeek: number[];
  completedWeeks: Record<string, boolean>;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}

export interface MonthlyHabit {
  id: string;
  title: string;
  type: 'monthly';
  period: MonthPeriod;
  targetCount: number;
  completedDays: Record<string, number>;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}

export type Habit = DailyHabit | WeeklyHabit | MonthlyHabit;

export interface UserTimezone {
  offset: number;
  label: string;
  iso: string;
}

export const TIMEZONES: UserTimezone[] = [
  { offset: 0, label: 'UTC', iso: 'UTC' },
  { offset: 120, label: 'GMT+2', iso: 'Europe/Berlin' },
  { offset: 300, label: 'GMT+5', iso: 'Asia/Karachi' },
  { offset: 480, label: 'GMT+8', iso: 'Asia/Shanghai' },
  { offset: -300, label: 'GMT-5', iso: 'America/New_York' },
  { offset: -360, label: 'GMT-6', iso: 'America/Chicago' },
  { offset: -480, label: 'GMT-8', iso: 'America/Los_Angeles' },
];
