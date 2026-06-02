import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

export interface FocusSession {
  taskId: string;
  phase: 'work' | 'break';
  secondsLeft: number;
  completedSessions: number;
}

interface UIState {
  darkMode: boolean;
  focusMode: boolean;
  sidebarOpen: boolean;
  activeTaskId: string | null;
  focusSession: FocusSession | null;
  toggleDarkMode: () => void;
  toggleFocusMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTaskId: (id: string | null) => void;
  saveFocusSession: (session: FocusSession) => void;
  clearFocusSession: () => void;
}

const stored = loadFromStorage<{ darkMode: boolean }>(STORAGE_KEYS.UI, {
  darkMode: false,
});

export const useUIStore = create<UIState>((set, get) => ({
  darkMode: stored.darkMode,
  focusMode: false,
  sidebarOpen: true,
  activeTaskId: null,
  focusSession: loadFromStorage<FocusSession | null>(STORAGE_KEYS.FOCUS_SESSION, null),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    saveToStorage(STORAGE_KEYS.UI, { darkMode: next });
    document.documentElement.classList.toggle('dark', next);
  },

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActiveTaskId: (id) => set({ activeTaskId: id }),

  saveFocusSession: (session) => {
    set({ focusSession: session });
    saveToStorage(STORAGE_KEYS.FOCUS_SESSION, session);
  },

  clearFocusSession: () => {
    set({ focusSession: null });
    saveToStorage(STORAGE_KEYS.FOCUS_SESSION, null);
  },
}));
