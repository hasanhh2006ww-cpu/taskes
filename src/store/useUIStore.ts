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

type ThemeMode = 'light' | 'dark' | 'auto';

interface UIState {
  darkMode: boolean;
  themeMode: ThemeMode;
  focusMode: boolean;
  sidebarOpen: boolean;
  activeTaskId: string | null;
  focusSession: FocusSession | null;
  focusSettings: FocusSettings;
  sidebarCollapsed: boolean;
  toggleDarkMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
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

function applyTheme(mode: ThemeMode) {
  const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export const useUIStore = create<UIState>((set, get) => ({
  darkMode: false,
  themeMode: 'light',
  focusMode: false,
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeTaskId: null,
  focusSession: null,
  focusSettings: defaultSettings,

  toggleDarkMode: () => {
    const cycle: ThemeMode[] = ['light', 'dark', 'auto'];
    const next = cycle[(cycle.indexOf(get().themeMode) + 1) % cycle.length];
    set({ themeMode: next, darkMode: next === 'dark' || (next === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) });
    saveToStorage(STORAGE_KEYS.UI, { themeMode: next });
    applyTheme(next);
  },

  setThemeMode: (mode) => {
    set({ themeMode: mode, darkMode: mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) });
    saveToStorage(STORAGE_KEYS.UI, { themeMode: mode });
    applyTheme(mode);
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
    const stored = loadFromStorage<{ themeMode?: ThemeMode }>(STORAGE_KEYS.UI, { themeMode: 'light' });
    const themeMode = stored.themeMode || 'light';
    const focusSession = loadFromStorage<FocusSession | null>(STORAGE_KEYS.FOCUS_SESSION, null);
    const focusSettings = loadFromStorage<FocusSettings>(STORAGE_KEYS.FOCUS_SETTINGS, defaultSettings);
    const sidebarCollapsed = loadFromStorage<boolean>('sidebar_collapsed', false);
    const isDark = themeMode === 'dark' || (themeMode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    set({
      darkMode: isDark,
      themeMode,
      focusSession,
      focusSettings,
      sidebarCollapsed,
    });
    applyTheme(themeMode);
  },
}));
