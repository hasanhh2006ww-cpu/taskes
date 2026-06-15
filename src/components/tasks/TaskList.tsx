'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskItem } from './TaskItem';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/cn';
import { Plus } from 'lucide-react';
import { PRIORITIES } from '@/lib/constants';
import type { Priority } from '@/lib/types';

export function TaskList() {
  const { addTask, reorderTasks, getFilteredTasks, filter, activeProjectId } = useTaskStore();
  const { projects } = useProjectStore();
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');

  const filteredTasks = getFilteredTasks();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = filteredTasks.findIndex((t) => t.id === active.id);
    const newIndex = filteredTasks.findIndex((t) => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderTasks(oldIndex, newIndex);
    }
  }

  function handleAdd() {
    if (!newTitle.trim()) return;
    addTask({ title: newTitle.trim(), priority: newPriority });
    setNewTitle('');
  }

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const headerTitle = activeProject
    ? activeProject.name
    : filter === 'all'
      ? 'جميع المهام'
      : filter === 'today'
        ? 'اليوم'
        : filter === 'important'
          ? 'مهمة'
          : 'المنجزة';

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">{headerTitle}</h1>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 md:text-sm">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'مهمة' : 'مهام'}
        </span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-3 py-2.5 backdrop-blur-sm transition-colors dark:border-zinc-800/40 dark:bg-zinc-900/40 focus-within:border-emerald-300/60 dark:focus-within:border-emerald-700/60">
          <Plus className="h-4 w-4 shrink-0 text-zinc-400" />
          <Input
            data-task-input
            placeholder="إضافة مهمة جديدة..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <div className="flex gap-1">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              onClick={() => setNewPriority(p.value)}
              className={cn(
                'rounded-lg px-2.5 py-2 text-[11px] font-medium transition-all sm:py-1.5',
                newPriority === p.value
                  ? p.color
                  : 'text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800'
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
        </DndContext>

        {filteredTasks.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-400 dark:bg-emerald-500/10">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">لا توجد مهام بعد</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600">
              اكتب أعلاه واضغط Enter للإضافة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
