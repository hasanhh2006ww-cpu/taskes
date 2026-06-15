import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Habit, DailyHabit, WeeklyHabit, MonthlyHabit, UserTimezone, WeeklyFrequency, MonthPeriod } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS, getToday, getDayOfWeek, getWeekKey, getWeekNumber, getMonthWeekKey, isToday, updateWeeklyHabitCompletion, updateMonthlyHabitCompletion, calculateWeeklyStreak, calculateMonthlyStreak } from '@/lib/constants';


interface HabitState {
  habits: Habit[];
  userTimezone: UserTimezone;
  activeFilter: 'daily' | 'weekly' | 'monthly';
  addHabit: (title: string, type: 'daily' | 'weekly' | 'monthly', options?: Partial<WeeklyHabit> | Partial<MonthlyHabit>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;
  toggleDailyCompletion: (id: string, date?: string, allowPastEdit?: boolean) => void;
  toggleWeeklyCompletion: (id: string, date?: string, allowPastEdit?: boolean) => void;
  toggleMonthlyCompletion: (id: string, date?: string, allowPastEdit?: boolean) => void;
  updateUserTimezone: (timezone: UserTimezone) => void;
  setActiveFilter: (filter: 'daily' | 'weekly' | 'monthly') => void;
  getFilteredHabits: () => Habit[];
  getTodayStats: () => { completed: number; total: number; streakCount: number };
  getWeekStats: (weekKey: string) => { completed: number; total: number; streakCount: number };
  getMonthStats: (monthKey: string) => { completed: number; total: number; streakCount: number };
}



const initialHabits = loadFromStorage<Habit[]>(STORAGE_KEYS.HABITS, []);
const initialTimezone = loadFromStorage<UserTimezone>(STORAGE_KEYS.USER_TIMEZONE, { offset: 0, label: 'UTC', iso: 'UTC' });


function calculateDailyStreak(habit: DailyHabit): number {
  const completedDays = Object.keys(habit.completions).filter((date) => habit.completions[date] === true).sort().reverse();
  if (completedDays.length === 0) return 0;

  let streak = 1;
  let currentDay = completedDays[0];
  for (let i = 1; i < completedDays.length; i++) {
    const prevDay = new Date(new Date(completedDays[i - 1]).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (prevDay === completedDays[i]) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function isDailyHabitCompleted(habit: DailyHabit, date: string): boolean {
  return habit.completions[date] === true;
}

function updateDailyHabitCompletion(habit: DailyHabit, date: string, completed: boolean, allowPastEdit: boolean = false): DailyHabit {
  const isCurrentDay = isToday(date);
  if (!allowPastEdit && !isCurrentDay && isDailyHabitCompleted(habit, date)) {
    return habit;
  }

  const completions = { ...habit.completions, [date]: completed };
  return { ...habit, completions };
}

function canEditPastDay(habit: DailyHabit, date: string): boolean {
  const today = getToday();
  if (isToday(date)) return true;
  if (!habit.lastCompletedDate) return true;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const isConsecutive = date === yesterday;

  return isConsecutive;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: initialHabits,
  userTimezone: initialTimezone,
  activeFilter: 'daily',

  addHabit: (title, type, options = {}) => {
    const { habits } = get();
    let newHabit: Habit;

    switch (type) {
      case 'daily':
        newHabit = {
          id: uuid(),
          title,
          type: 'daily',
          createdAt: Date.now(),
          order: habits.length,
          completions: {},
          streak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
        } as DailyHabit;
        break;

      case 'weekly':
        const weeklyOptions = options as Partial<WeeklyHabit>;
        newHabit = {
          id: uuid(),
          title,
          type: 'weekly',
          frequency: weeklyOptions.frequency || 3,
          daysOfWeek: weeklyOptions.daysOfWeek || [1, 3, 5],
          createdAt: Date.now(),
          order: habits.length,
          completedWeeks: {},
          streak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
        } as WeeklyHabit;
        break;

      case 'monthly':
        const monthlyOptions = options as Partial<MonthlyHabit>;
        newHabit = {
          id: uuid(),
          title,
          type: 'monthly',
          period: monthlyOptions.period || 'middle',
          targetCount: monthlyOptions.targetCount || 4,
          createdAt: Date.now(),
          order: habits.length,
          completedDays: {},
          streak: 0,
          bestStreak: 0,
          lastCompletedDate: null,
        } as MonthlyHabit;
        break;

      default:
        throw new Error(`Unsupported habit type: ${type}`);
    }

    const updated = [...habits, newHabit];
    set({ habits: updated });
    saveToStorage(STORAGE_KEYS.HABITS, updated);
  },

  updateHabit: (id, updates) => {
    const habits = get().habits.map((h) => (h.id === id ? { ...h, ...updates } as Habit : h));
    set({ habits });
    saveToStorage(STORAGE_KEYS.HABITS, habits);
  },

  deleteHabit: (id) => {
    const habits = get().habits.filter((h) => h.id !== id);
    set({ habits });
    saveToStorage(STORAGE_KEYS.HABITS, habits);
  },

  reorderHabits: (fromIndex, toIndex) => {
    const habits = [...get().habits];
    const [moved] = habits.splice(fromIndex, 1);
    habits.splice(toIndex, 0, moved);
    const reordered = habits.map((h, i) => ({ ...h, order: i }));
    set({ habits: reordered });
    saveToStorage(STORAGE_KEYS.HABITS, reordered);
  },

  toggleDailyCompletion: (id, date = getToday(), allowPastEdit = false) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === id) as DailyHabit | undefined;
    if (!habit || habit.type !== 'daily') return;

    const isCurrentDay = isToday(date);
    if (!allowPastEdit && !isCurrentDay && isDailyHabitCompleted(habit, date)) {
      return;
    }

    const updated = habits.map((h) => {
      if (h.id !== id || h.type !== 'daily') return h;

      const dailyHabit = h as DailyHabit;
      const newCompletions = { ...dailyHabit.completions };
      const wasCompleted = newCompletions[date] === true;
      newCompletions[date] = !wasCompleted;

      const completedDays = Object.keys(newCompletions).filter((d) => newCompletions[d] === true).sort().reverse();
      let newStreak = 0;
      if (completedDays.length > 0) {
        newStreak = calculateDailyStreak({ ...dailyHabit, completions: newCompletions });
      }

      const completedToday = newCompletions[getToday()] === true;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const completedYesterday = newCompletions[yesterday] === true;

      let newLastCompletedDate = dailyHabit.lastCompletedDate;
      if (!wasCompleted && date === getToday()) {
        if (completedYesterday || dailyHabit.lastCompletedDate === yesterday) {
          newLastCompletedDate = getToday();
        } else {
          newLastCompletedDate = null;
        }
      } else if (wasCompleted && date === getToday()) {
        if (dailyHabit.lastCompletedDate === getToday()) {
          newLastCompletedDate = null;
        } else if (completedYesterday) {
          newLastCompletedDate = yesterday;
        }
      }

      return {
        ...dailyHabit,
        completions: newCompletions,
        streak: newStreak,
        bestStreak: Math.max(newStreak, dailyHabit.bestStreak),
        lastCompletedDate: newLastCompletedDate,
      } as DailyHabit;
    });

    set({ habits: updated });
    saveToStorage(STORAGE_KEYS.HABITS, updated);
  },

  toggleWeeklyCompletion: (id, date = getToday(), allowPastEdit = false) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === id) as WeeklyHabit | undefined;
    if (!habit || habit.type !== 'weekly') return;

    const weekKey = getWeekKey(date);
    const isCurrentWeek = weekKey === getWeekKey(getToday());
    if (!allowPastEdit && !isCurrentWeek && habit.completedWeeks[weekKey]) {
      return;
    }

    const updated = habits.map((h) => {
      if (h.id !== id || h.type !== 'weekly') return h;

      const weeklyHabit = h as WeeklyHabit;
      const newCompletedWeeks = { ...weeklyHabit.completedWeeks };
      const wasCompleted = newCompletedWeeks[weekKey] === true;
      newCompletedWeeks[weekKey] = !wasCompleted;

      const newStreak = calculateWeeklyStreak({ ...weeklyHabit, completedWeeks: newCompletedWeeks }, date);
      const completedThisWeek = newCompletedWeeks[getWeekKey(getToday())] === true;
      const completedLastWeek = newCompletedWeeks[getWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])] === true;

      let newLastCompletedDate = weeklyHabit.lastCompletedDate;
      if (!wasCompleted && isCurrentWeek) {
        if (completedLastWeek || weeklyHabit.lastCompletedDate === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
          newLastCompletedDate = date;
        } else {
          newLastCompletedDate = null;
        }
      } else if (wasCompleted && isCurrentWeek) {
        if (weeklyHabit.lastCompletedDate === date) {
          newLastCompletedDate = null;
        } else if (completedLastWeek) {
          newLastCompletedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
      }

      return {
        ...weeklyHabit,
        completedWeeks: newCompletedWeeks,
        streak: newStreak,
        bestStreak: Math.max(newStreak, weeklyHabit.bestStreak),
        lastCompletedDate: newLastCompletedDate,
      } as WeeklyHabit;
    });

    set({ habits: updated });
    saveToStorage(STORAGE_KEYS.HABITS, updated);
  },

  toggleMonthlyCompletion: (id, date = getToday(), allowPastEdit = false) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === id) as MonthlyHabit | undefined;
    if (!habit || habit.type !== 'monthly') return;

    const weekKey = getMonthWeekKey(date);
    const isCurrentWeek = weekKey === getMonthWeekKey(getToday());
    if (!allowPastEdit && !isCurrentWeek && habit.completedDays[weekKey] && habit.completedDays[weekKey] >= 1) {
      return;
    }

    const updated = habits.map((h) => {
      if (h.id !== id || h.type !== 'monthly') return h;

      const monthlyHabit = h as MonthlyHabit;
      const newCompletedDays = { ...monthlyHabit.completedDays };
      const currentCount = newCompletedDays[weekKey] || 0;
      const wasCompleted = currentCount >= 1;
      newCompletedDays[weekKey] = wasCompleted ? Math.max(0, currentCount - 1) : currentCount + 1;

      const newStreak = calculateMonthlyStreak({ ...monthlyHabit, completedDays: newCompletedDays }, date);
      const completedThisWeek = (newCompletedDays[getMonthWeekKey(getToday())] || 0) >= 1;
      const completedLastWeek = (newCompletedDays[getMonthWeekKey(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])] || 0) >= 1;

      let newLastCompletedDate = monthlyHabit.lastCompletedDate;
      if (!wasCompleted && isCurrentWeek) {
        if (completedLastWeek || monthlyHabit.lastCompletedDate === new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) {
          newLastCompletedDate = date;
        } else {
          newLastCompletedDate = null;
        }
      } else if (wasCompleted && isCurrentWeek) {
        if (monthlyHabit.lastCompletedDate === date) {
          newLastCompletedDate = null;
        } else if (completedLastWeek) {
          newLastCompletedDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
      }

      return {
        ...monthlyHabit,
        completedDays: newCompletedDays,
        streak: newStreak,
        bestStreak: Math.max(newStreak, monthlyHabit.bestStreak),
        lastCompletedDate: newLastCompletedDate,
      } as MonthlyHabit;
    });

    set({ habits: updated });
    saveToStorage(STORAGE_KEYS.HABITS, updated);
  },

  updateUserTimezone: (timezone) => {
    set({ userTimezone: timezone });
    saveToStorage(STORAGE_KEYS.USER_TIMEZONE, timezone);
  },

  setActiveFilter: (filter) => set({ activeFilter: filter }),

  getFilteredHabits: () => {
    const { habits, activeFilter } = get();
    switch (activeFilter) {
      case 'daily':
        return habits.filter((h): h is DailyHabit => h.type === 'daily');
      case 'weekly':
        return habits.filter((h): h is WeeklyHabit => h.type === 'weekly');
      case 'monthly':
        return habits.filter((h): h is MonthlyHabit => h.type === 'monthly');
      default:
        return habits;
    }
  },

  getTodayStats: () => {
    const { habits } = get();
    let completed = 0;
    let total = 0;
    let streakCount = 0;
    const today = getToday();

    habits.forEach((habit) => {
      if (habit.type === 'daily') {
        total++;
        if (habit.completions[today] === true) {
          completed++;
        }
        streakCount += habit.streak;
      } else if (habit.type === 'weekly') {
        total++;
        if (habit.completedWeeks[getWeekKey(today)] === true) {
          completed++;
        }
        streakCount += habit.streak;
      } else if (habit.type === 'monthly') {
        total++;
        if ((habit.completedDays[getMonthWeekKey(today)] || 0) >= 1) {
          completed++;
        }
        streakCount += habit.streak;
      }
    });

    return { completed, total, streakCount };
  },

  getWeekStats: (weekKey) => {
    const { habits } = get();
    let completed = 0;
    let total = 0;
    let streakCount = 0;

    habits.forEach((habit) => {
      if (habit.type === 'daily') {
        const daysInWeek = Object.keys(habit.completions).filter((date) => getWeekKey(date) === weekKey);
        total += daysInWeek.length;
        completed += daysInWeek.filter((date) => habit.completions[date] === true).length;
        streakCount += habit.streak;
      } else if (habit.type === 'weekly') {
        total++;
        if (habit.completedWeeks[weekKey] === true) {
          completed++;
        }
        streakCount += habit.streak;
      } else if (habit.type === 'monthly') {
        total++;
        if (habit.completedDays[weekKey] && habit.completedDays[weekKey] >= 1) {
          completed++;
        }
        streakCount += habit.streak;
      }
    });

    return { completed, total, streakCount };
  },

  getMonthStats: (monthKey) => {
    const { habits } = get();
    let completed = 0;
    let total = 0;
    let streakCount = 0;
    const [year, month] = monthKey.split('-');

    habits.forEach((habit) => {
      if (habit.type === 'daily') {
        const monthPrefix = `${year}-${month}`;
        const daysThisMonth = Object.keys(habit.completions).filter(d => d.startsWith(monthPrefix));
        total += daysThisMonth.length;
        completed += daysThisMonth.filter(d => habit.completions[d] === true).length;
        streakCount += habit.streak;
      } else if (habit.type === 'weekly') {
        total++;
        if (habit.completedWeeks[monthKey] === true) {
          completed++;
        }
        streakCount += habit.streak;
      } else if (habit.type === 'monthly') {
        total++;
        if (habit.completedDays[monthKey] && habit.completedDays[monthKey] >= 1) {
          completed++;
        }
        streakCount += habit.streak;
      }
    });

    return { completed, total, streakCount };
  },
}));