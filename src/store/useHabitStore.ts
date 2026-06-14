import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Habit } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS, getToday } from '@/lib/constants';

interface HabitState {
  habits: Habit[];
  addHabit: (title: string) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  reorderHabits: (fromIndex: number, toIndex: number) => void;
  toggleCompletion: (id: string, date?: string) => void;
  getHabits: () => Habit[];
}

const initialHabits = loadFromStorage<Habit[]>(STORAGE_KEYS.HABITS, []);

function calculateStreak(completions: Record<string, boolean>, lastCompletedDate: string | null): number {
  const today = getToday();
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!lastCompletedDate) return 0;

  const completedToday = completions[today] === true;
  const completedYesterday = completions[yesterday] === true;

  if (completedToday && completedYesterday) {
    return 1;
  }
  if (completedToday && lastCompletedDate === yesterday) {
    return 1;
  }

  return 0;
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: initialHabits,

  addHabit: (title) => {
    const { habits } = get();
    const newHabit: Habit = {
      id: uuid(),
      title,
      createdAt: Date.now(),
      order: habits.length,
      completions: {},
      streak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
    };
    const updated = [...habits, newHabit];
    set({ habits: updated });
    saveToStorage(STORAGE_KEYS.HABITS, updated);
  },

  updateHabit: (id, updates) => {
    const habits = get().habits.map((h) => (h.id === id ? { ...h, ...updates } : h));
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

      toggleCompletion: (id, date = getToday()) => {
    const { habits } = get();
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const completions = { ...habit.completions };
    const wasCompleted = completions[date] === true;
    completions[date] = !wasCompleted;

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const completedYesterday = completions[yesterday] === true;
    const completedToday = completions[getToday()] === true;

    let newStreak = habit.streak;
    let newLastCompletedDate = habit.lastCompletedDate;
    let newBestStreak = habit.bestStreak;

    if (!wasCompleted) {
      if (date === getToday()) {
        if (completedYesterday || habit.lastCompletedDate === yesterday) {
          newStreak = habit.streak + 1;
          newBestStreak = Math.max(newStreak, habit.bestStreak);
        } else {
          newStreak = 1;
          newBestStreak = Math.max(newStreak, habit.bestStreak);
        }
        newLastCompletedDate = getToday();
      }
    } else {
      if (date === getToday()) {
        if (habit.lastCompletedDate === getToday()) {
          newStreak = Math.max(0, habit.streak - 1);
        }
        if (completedYesterday) {
          newLastCompletedDate = yesterday;
        } else {
          newLastCompletedDate = null;
        }
      }
    }

    const updated = habits.map((h) =>
      h.id === id ? { ...h, completions, streak: newStreak, bestStreak: newBestStreak, lastCompletedDate: newLastCompletedDate } : h
    );
    set({ habits: updated });
    saveToStorage(STORAGE_KEYS.HABITS, updated);
  },

  getHabits: () => get().habits.sort((a, b) => a.order - b.order),
}));