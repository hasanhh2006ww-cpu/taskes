'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { cn } from '@/lib/cn';

export default function Home() {
  const { focusMode, activeTaskId } = useUIStore();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('[data-task-input]');
    if (!input) return;
    const onFocus = () => setIsAdding(true);
    const onBlur = () => {
      setTimeout(() => {
        if (document.activeElement !== input) setIsAdding(false);
      }, 120);
    };
    input.addEventListener('focus', onFocus);
    input.addEventListener('blur', onBlur);
    return () => {
      input.removeEventListener('focus', onFocus);
      input.removeEventListener('blur', onBlur);
    };
  }, []);

  const showDetailPanel = !focusMode && (!!activeTaskId || isAdding);

  return (
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
          !showDetailPanel && 'hidden'
        )}
      >
        <TaskDetail />
      </div>
    </div>
  );
}
