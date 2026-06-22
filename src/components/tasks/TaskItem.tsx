'use client';

import { memo, useRef, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GripVertical, Trash2, Star, Circle, CheckCircle2, ChevronDown, ListChecks } from 'lucide-react';
import { PRIORITIES } from '@/lib/constants';
import type { Task } from '@/lib/types';

const SWIPE_THRESHOLD = 80;

interface TaskItemProps {
  task: Task;
}

export const TaskItem = memo(function TaskItem({ task }: TaskItemProps) {
  const { toggleComplete, toggleImportant, deleteTask, setActiveTaskId, activeTaskId, expandedTasks, toggleTaskExpanded, updateTask } = useTaskStore();
  const projects = useProjectStore((s) => s.projects);
  const { focusMode } = useUIStore();
  const project = task.projectId ? projects.find((p) => p.id === task.projectId) : null;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITIES.find((p) => p.value === task.priority);
  const isActive = activeTaskId === task.id;

  const [swipeX, setSwipeX] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipingRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.target instanceof HTMLElement && e.target.closest('[data-no-swipe]')) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swipingRef.current = false;
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
    if (Math.abs(dx) < Math.abs(dy)) {
      swipingRef.current = false;
      return;
    }
    e.preventDefault();
    swipingRef.current = true;
    setSwipeX(Math.max(-160, Math.min(160, dx)));
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!swipeStart.current) return;
    if (swipingRef.current) {
      if (swipeX > SWIPE_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(8);
        toggleComplete(task.id);
      } else if (swipeX < -SWIPE_THRESHOLD) {
        if (navigator.vibrate) navigator.vibrate(8);
        deleteTask(task.id);
      }
    }
    setSwipeX(0);
    swipeStart.current = null;
    swipingRef.current = false;
  }, [swipeX, task.id, toggleComplete, deleteTask]);

  if (focusMode && !isActive && !task.completed) return null;

  const actionOpacity = Math.min(1, Math.abs(swipeX) / SWIPE_THRESHOLD);
  const isRightSwipe = swipeX > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0, overflow: 'hidden' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-200',
        'border-zinc-200/60 dark:border-zinc-800/40',
        'card-hover',
        task.completed && 'opacity-60',
        isActive &&
          'border-emerald-300/60 dark:border-emerald-700/60 ring-1 ring-emerald-500/10',
        isDragging && 'z-50 scale-105 shadow-xl opacity-90 dark:shadow-black/40'
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex">
        <div
          className={cn(
            'flex flex-1 items-center justify-start ps-4 transition-colors duration-150',
            swipeX > 0 && 'bg-emerald-500/10 dark:bg-emerald-500/20'
          )}
        >
          <CheckCircle2
            className="h-5 w-5 text-emerald-500 transition-opacity"
            style={{ opacity: isRightSwipe ? actionOpacity : 0 }}
          />
        </div>
        <div
          className={cn(
            'flex flex-1 items-center justify-end pe-4 transition-colors duration-150',
            swipeX < 0 && 'bg-rose-500/10 dark:bg-rose-500/20'
          )}
        >
          <Trash2
            className="h-5 w-5 text-rose-500 transition-opacity"
            style={{ opacity: !isRightSwipe ? actionOpacity : 0 }}
          />
        </div>
      </div>

      <motion.div
        className="relative flex items-start gap-2 p-2.5 sm:p-3"
        animate={{ x: swipeX }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'pan-y' }}
      >
        <button
          {...attributes}
          {...listeners}
          data-no-swipe
          className="mt-0.5 cursor-grab touch-none text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          data-no-swipe
          onClick={() => toggleComplete(task.id)}
          className="mt-0.5 shrink-0 text-zinc-300 transition-all duration-200 hover:text-emerald-500 dark:text-zinc-600 dark:hover:text-emerald-400"
        >
          {task.completed ? (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            </motion.span>
          ) : (
            <Circle className="h-5 w-5 transition-colors duration-200 hover:text-emerald-400" />
          )}
        </button>

        <div
          data-no-swipe
          className="min-w-0 flex-1 cursor-pointer py-0.5"
          onClick={() => setActiveTaskId(task.id)}
        >
          <span
            className={cn(
              'text-sm font-medium transition-all duration-200',
              task.completed
                ? 'text-zinc-400 line-through dark:text-zinc-500'
                : 'text-zinc-800 dark:text-zinc-200'
            )}
          >
            {task.title}
          </span>
          <div className="mt-0.5 flex items-center gap-1.5">
            {project && (
              <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] leading-none" style={{ backgroundColor: project.color + '20', color: project.color }}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: project.color }} />
                {project.name}
              </span>
            )}
            {task.dueDate && (
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {new Date(task.dueDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {priority && (
          <Badge className={priority.color}>{priority.label}</Badge>
        )}

        <Button size="icon" onClick={() => toggleImportant(task.id)}>
          <Star
            className={cn('h-4 w-4 md:h-3.5 md:w-3.5', task.important && 'fill-amber-400 text-amber-400')}
          />
        </Button>

        <Button size="icon" onClick={() => toggleTaskExpanded(task.id)} data-no-swipe>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              expandedTasks[task.id] && 'rotate-180'
            )}
          />
        </Button>

        <Button size="icon" variant="danger" onClick={() => deleteTask(task.id)}>
          <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
        </Button>
      </motion.div>

      <motion.div layout className="overflow-hidden">
        {expandedTasks[task.id] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
        <div className="border-t border-zinc-100 dark:border-zinc-800/50 px-2.5 sm:px-3 py-2 space-y-2">
          {task.description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {task.description}
            </p>
          )}

          {(task.subtasks ?? []).length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                <ListChecks className="h-3 w-3" />
                <span>المهام الفرعية ({(task.subtasks ?? []).filter((s) => s.completed).length}/{(task.subtasks ?? []).length})</span>
              </div>
              {(task.subtasks ?? []).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    const updated = (task.subtasks ?? []).map((s) =>
                      s.id === sub.id ? { ...s, completed: !s.completed } : s
                    );
                    updateTask(task.id, { subtasks: updated });
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-start text-xs transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                >
                  {sub.completed ? (
                    <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                  ) : (
                    <Circle className="h-3 w-3 shrink-0 text-zinc-300 dark:text-zinc-600" />
                  )}
                  <span className={cn(sub.completed && 'text-zinc-400 line-through dark:text-zinc-500')}>
                    {sub.title}
                  </span>
                </button>
              ))}
            </div>
          )}

          {(task.activityLog ?? []).length > 0 && (
            <div className="space-y-1">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">النشاطات</span>
              {(task.activityLog ?? []).slice(-3).reverse().map((entry) => (
                <div key={entry.id} className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span className="text-[10px] text-zinc-300 dark:text-zinc-600">
                    {new Date(entry.timestamp).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                  </span>
                  <span>{entry.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
});
