'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useHabitStore } from '@/store/useHabitStore';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { FocusMode } from '@/components/focus/FocusMode';
import { cn } from '@/lib/cn';
import { loadFromStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { startNotificationChecker, stopNotificationChecker } from '@/lib/notificationManager';
import { Menu, X } from 'lucide-react';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { focusMode, toggleFocusMode, sidebarOpen, setSidebarOpen, sidebarCollapsed } = useUIStore();

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
          'fixed inset-y-0 start-0 z-40 md:relative md:z-0 md:shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0'
        )}
        style={{
          width: sidebarCollapsed ? 78 : 268,
          transition: 'width 300ms ease-in-out, transform 200ms ease-in-out',
        }}
      >
        <div className="p-1 h-full">
          <Sidebar />
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed start-3 top-3 z-50 flex h-11 w-11 items-center justify-center rounded-xl glass shadow-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/80 md:hidden"
        aria-label={sidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <main className="flex min-w-0 flex-1 overflow-hidden pt-14 md:pt-0">
        {children}
      </main>

      <CommandPalette />

      <AnimatePresence>
        {focusMode && <FocusMode />}
      </AnimatePresence>
    </div>
  );
}
