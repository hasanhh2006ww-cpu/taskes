import { create } from 'zustand';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

export interface FocusSession {
  taskId: string;
  phase: 'work' | 'break';
  secondsLeft: number;
  completedSessions: number;
}

export interface FocusSettings {
  workMin: number;
  breakMin: number;
  youtubeUrl: string;
  endSound: string;
  endSoundUrl: string;
}

interface UIState {
  darkMode: boolean;
  focusMode: boolean;
  sidebarOpen: boolean;
  activeTaskId: string | null;
  focusSession: FocusSession | null;
  focusSettings: FocusSettings;
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  toggleFocusMode: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTaskId: (id: string | null) => void;
  toggleSidebarCollapsed: () => void;
  saveFocusSession: (session: FocusSession) => void;
  clearFocusSession: () => void;
  updateFocusSettings: (settings: Partial<FocusSettings>) => void;
  rehydrate: () => void;
}

const defaultSettings: FocusSettings = { workMin: 25, breakMin: 5, youtubeUrl: '', endSound: 'chime', endSoundUrl: '' };

export const useUIStore = create<UIState>((set, get) => ({
  darkMode: false,
  focusMode: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeTaskId: null,
  focusSession: null,
  focusSettings: defaultSettings,

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    saveToStorage(STORAGE_KEYS.UI, { darkMode: next });
    document.documentElement.classList.toggle('dark', next);
  },

  toggleFocusMode: () => set((s) => ({ focusMode: !s.focusMode })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActiveTaskId: (id) => set({ activeTaskId: id }),

  toggleSidebarCollapsed: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    saveToStorage('sidebar_collapsed', next);
  },

  saveFocusSession: (session) => {
    set({ focusSession: session });
    saveToStorage(STORAGE_KEYS.FOCUS_SESSION, session);
  },

  clearFocusSession: () => {
    set({ focusSession: null });
    saveToStorage(STORAGE_KEYS.FOCUS_SESSION, null);
  },

  updateFocusSettings: (settings) => {
    const next = { ...get().focusSettings, ...settings };
    set({ focusSettings: next });
    saveToStorage(STORAGE_KEYS.FOCUS_SETTINGS, next);
  },

  rehydrate: () => {
    const stored = loadFromStorage<{ darkMode: boolean }>(STORAGE_KEYS.UI, { darkMode: false });
    const focusSession = loadFromStorage<FocusSession | null>(STORAGE_KEYS.FOCUS_SESSION, null);
    const focusSettings = loadFromStorage<FocusSettings>(STORAGE_KEYS.FOCUS_SETTINGS, defaultSettings);
    const sidebarCollapsed = loadFromStorage<boolean>('sidebar_collapsed', false);
    set({
      darkMode: stored.darkMode,
      focusSession,
      focusSettings,
      sidebarCollapsed,
    });
  },
}));
