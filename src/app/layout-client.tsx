'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useHabitStore } from '@/store/useHabitStore';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
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
    const stored = loadFromStorage<{ themeMode?: string }>(STORAGE_KEYS.UI, { themeMode: 'light' });
    const mode = stored.themeMode || 'light';
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
    if (mode === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => document.documentElement.classList.toggle('dark', e.matches);
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
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
          'fixed inset-y-0 start-0 z-40',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full',
          'md:relative md:inset-auto md:z-0 md:shrink-0 md:translate-x-0',
          'w-[280px] md:w-[268px]',
          sidebarCollapsed && 'lg:w-[78px]'
        )}
        style={{
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

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex min-w-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>

      <CommandPalette />

      <AnimatePresence>
        {focusMode && <FocusMode />}
      </AnimatePresence>
    </div>
  );
}
