'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Sidebar } from '@/components/layout/Sidebar';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { FocusMode } from '@/components/focus/FocusMode';
import { HabitTrackerPro } from '@/components/habits/HabitTrackerPro';
import { CalendarView } from '@/components/calendar/CalendarView';
import { SettingsView } from '@/components/settings/SettingsView';
import { cn } from '@/lib/cn';
import { loadFromStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { startNotificationChecker, stopNotificationChecker } from '@/lib/notificationManager';
import { useHabitStore } from '@/store/useHabitStore';
import { Menu, X } from 'lucide-react';

type View = 'app' | 'dashboard' | 'habits' | 'calendar' | 'settings';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
} as const;

export default function Home() {
  const [view, setView] = useState<View>('app');
  const { focusMode, toggleFocusMode, sidebarOpen, setSidebarOpen, activeTaskId, sidebarCollapsed } = useUIStore();

  useKeyboard([
    { key: 'f', handler: () => toggleFocusMode() },
    {
      key: 'n',
      handler: () => {
        const input = document.querySelector<HTMLInputElement>('[data-task-input]');
        input?.focus();
      },
    },
  ]);

  useEffect(() => {
    const stored = loadFromStorage<{ darkMode: boolean }>(STORAGE_KEYS.UI, { darkMode: false });
    if (stored.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    startNotificationChecker(
      () => useHabitStore.getState().habits,
      useHabitStore.getState().userTimezone.iso
    );
    return () => stopNotificationChecker();
  }, []);

  const showDetailPanel = !focusMode && activeTaskId;

  return (
    <div
      className={cn(
        'flex h-full overflow-hidden overscroll-none transition-colors duration-200',
        'bg-zinc-50 text-zinc-900 dark:bg-gradient-to-br dark:from-[#0A0E17] dark:via-[#111827] dark:to-[#020617] dark:text-zinc-100'
      )}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 start-0 z-40 transition-all duration-300 ease-in-out md:relative',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          sidebarCollapsed ? 'md:w-16' : 'md:w-64'
        )}
      >
        <Sidebar view={view} onViewChange={setView} />
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed start-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-lg bg-white/80 text-zinc-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-zinc-100 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:bg-zinc-800/80 md:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.main key="dashboard" {...pageVariants} className="flex flex-1 overflow-hidden pt-14 md:pt-0">
            <Dashboard onViewChange={setView} />
          </motion.main>
        ) : view === 'habits' ? (
          <motion.main key="habits" {...pageVariants} className="flex flex-1 overflow-hidden pt-14 md:pt-0">
            <HabitTrackerPro />
          </motion.main>
        ) : view === 'calendar' ? (
          <motion.main key="calendar" {...pageVariants} className="flex flex-1 overflow-hidden pt-14 md:pt-0">
            <CalendarView />
          </motion.main>
        ) : view === 'settings' ? (
          <motion.main key="settings" {...pageVariants} className="flex flex-1 overflow-hidden pt-14 md:pt-0">
            <SettingsView />
          </motion.main>
        ) : (
          <motion.main key="app" {...pageVariants} className="flex flex-1 flex-col overflow-hidden pt-14 md:pt-0">
            <div className="flex flex-1 min-w-0">
              <div
                className={cn(
                  'flex-1 min-w-0 overflow-hidden border-e border-zinc-200/60 dark:border-zinc-800/60',
                  focusMode && 'max-w-2xl mx-auto border-e-0',
                  showDetailPanel && 'hidden md:flex md:flex-1'
                )}
              >
                <TaskList />
              </div>

              <div
                className={cn(
                  'w-full shrink-0 md:w-80',
                  focusMode && 'hidden',
                  !showDetailPanel && 'hidden md:block'
                )}
              >
                <TaskDetail />
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      <CommandPalette />

      <AnimatePresence>
        {focusMode && <FocusMode />}
      </AnimatePresence>
    </div>
  );
}
