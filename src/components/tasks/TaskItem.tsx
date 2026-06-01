'use client';

import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useTaskStore } from '@/store/useTaskStore';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GripVertical, Trash2, Star, Circle, CheckCircle2 } from 'lucide-react';
import { PRIORITIES } from '@/lib/constants';
import type { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
}

export const TaskItem = memo(function TaskItem({ task }: TaskItemProps) {
  const { toggleComplete, toggleImportant, deleteTask, setActiveTaskId, activeTaskId } = useTaskStore();
  const { focusMode } = useUIStore();

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

  if (focusMode && !isActive && !task.completed) return null;

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
        'group flex items-start gap-2 rounded-xl border p-2.5 sm:p-3',
        'border-zinc-200/60 bg-white/70 hover:border-zinc-300/60 hover:shadow-sm',
        'dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:hover:border-zinc-700/60',
        isDragging && 'z-50 scale-105 shadow-xl opacity-90',
        task.completed && 'opacity-50',
        isActive &&
          'border-indigo-300/60 bg-indigo-50/50 shadow-sm dark:border-indigo-700/60 dark:bg-indigo-950/30'
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 cursor-grab touch-none text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <button
        onClick={() => toggleComplete(task.id)}
        className="mt-0.5 shrink-0 text-zinc-300 hover:text-indigo-500 dark:text-zinc-600 dark:hover:text-indigo-400"
      >
        {task.completed ? (
          <CheckCircle2 className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      <div
        className="min-w-0 flex-1 cursor-pointer py-0.5"
        onClick={() => setActiveTaskId(task.id)}
      >
        <span
          className={cn(
            'text-sm font-medium text-zinc-800 dark:text-zinc-200',
            task.completed && 'line-through text-zinc-400 dark:text-zinc-500'
          )}
        >
          {task.title}
        </span>
        {task.dueDate && (
          <span className="me-2 text-[11px] text-zinc-400 dark:text-zinc-500">
            {new Date(task.dueDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      {priority && (
        <Badge className={priority.color}>{priority.label}</Badge>
      )}

      <Button size="icon" onClick={() => toggleImportant(task.id)}>
        <Star
          className={cn('h-4 w-4 md:h-3.5 md:w-3.5', task.important && 'fill-amber-400 text-amber-400')}
        />
      </Button>

      <Button size="icon" variant="danger" onClick={() => deleteTask(task.id)}>
        <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
      </Button>
    </motion.div>
  );
});
