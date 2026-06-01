'use client';

import { useEffect, useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Sidebar } from '@/components/layout/Sidebar';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { CommandPalette } from '@/components/command-palette/CommandPalette';
import { cn } from '@/lib/cn';
import { loadFromStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

type View = 'app' | 'dashboard';

export default function Home() {
  const [view, setView] = useState<View>('app');
  const { darkMode, focusMode, toggleFocusMode } = useUIStore();
  const activeTaskId = useUIStore((s) => s.activeTaskId);

  useKeyboard([
    { key: 'f', handler: () => toggleFocusMode() },
  ]);

  useEffect(() => {
    const stored = loadFromStorage<{ darkMode: boolean }>(STORAGE_KEYS.UI, { darkMode: false });
    if (stored.darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div
      className={cn(
        'flex h-full overflow-hidden transition-colors duration-200',
        'bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100'
      )}
    >
      <Sidebar view={view} onViewChange={setView} />

      {view === 'dashboard' ? (
        <main className="flex flex-1 overflow-hidden">
          <Dashboard />
        </main>
      ) : (
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1">
            <div
              className={cn(
                'flex-1 overflow-hidden border-r border-zinc-200/60 dark:border-zinc-800/60',
                focusMode && 'max-w-2xl mx-auto border-r-0'
              )}
            >
              <TaskList />
            </div>

            <div className={cn('w-80 flex-shrink-0', focusMode && 'hidden')}>
              <TaskDetail />
            </div>
          </div>
        </main>
      )}

      <CommandPalette />
    </div>
  );
}
