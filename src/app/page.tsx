'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Sidebar } from '@/components/layout/Sidebar';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { FocusMode } from '@/components/focus/FocusMode';
import { HabitTrackerPro } from '@/components/habits/HabitTrackerPro';
import { cn } from '@/lib/cn';
import { loadFromStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { Menu, X } from 'lucide-react';

type View = 'app' | 'dashboard' | 'habits';

export default function Home() {
  const [view, setView] = useState<View>('app');
  const { focusMode, toggleFocusMode, sidebarOpen, setSidebarOpen, activeTaskId } = useUIStore();

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
          'fixed inset-y-0 start-0 z-40 transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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

      {view === 'dashboard' ? (
        <main className="flex flex-1 overflow-hidden pt-14 md:pt-0">
          <Dashboard />
        </main>
      ) : view === 'habits' ? (
        <main className="flex flex-1 overflow-hidden pt-14 md:pt-0">
          <HabitTrackerPro />
        </main>
      ) : (
        <main className="flex flex-1 flex-col overflow-hidden pt-14 md:pt-0">
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
        </main>
      )}

      <CommandPalette />

      <AnimatePresence>
        {focusMode && <FocusMode />}
      </AnimatePresence>
    </div>
  );
}
