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
import { Button } from '@/components/ui/Button';
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
      ? 'All Tasks'
      : filter === 'today'
        ? 'Today'
        : filter === 'important'
          ? 'Important'
          : 'Completed';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{headerTitle}</h1>
        <span className="text-sm text-zinc-400 dark:text-zinc-500">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2 px-6 pb-4">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-3 py-2 backdrop-blur-sm dark:border-zinc-800/60 dark:bg-zinc-900/50">
          <Plus className="h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Add a new task..."
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
                'rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all',
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

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col gap-2">
                {filteredTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </AnimatePresence>
          </SortableContext>
        </DndContext>

        {filteredTasks.length === 0 && (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No tasks yet</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600">
              Type above and press Enter to add one
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
