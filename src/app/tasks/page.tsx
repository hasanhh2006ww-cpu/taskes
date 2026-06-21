'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { cn } from '@/lib/cn';

export default function TasksPage() {
  const { focusMode } = useUIStore();
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const setActiveTaskId = useTaskStore((s) => s.setActiveTaskId);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const input = document.querySelector<HTMLInputElement>('[data-task-input]');
    if (!input) return;
    const onFocus = () => setIsAdding(true);
    input.addEventListener('focus', onFocus);
    return () => input.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsAdding(false);
        setActiveTaskId(null);
        document.querySelector<HTMLInputElement>('[data-task-input]')?.blur();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveTaskId]);

  const handleClose = useCallback(() => {
    setIsAdding(false);
    setActiveTaskId(null);
  }, [setActiveTaskId]);

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
        <TaskDetail onClose={handleClose} />
      </div>
    </div>
  );
}
