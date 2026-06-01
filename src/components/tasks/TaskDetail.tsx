'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { PRIORITIES } from '@/lib/constants';
import { Calendar, Trash2, Star, X } from 'lucide-react';
import type { Priority } from '@/lib/types';

export function TaskDetail() {
  const { tasks, activeTaskId, setActiveTaskId, updateTask, deleteTask, toggleComplete, toggleImportant } =
    useTaskStore();
  const projects = useProjectStore((s) => s.projects);
  const task = tasks.find((t) => t.id === activeTaskId);

  const [editTitle, setEditTitle] = useState('');

  const taskNotNull = task;

  useEffect(() => {
    if (taskNotNull) setEditTitle(taskNotNull.title);
  }, [taskNotNull?.id]);

  if (!taskNotNull) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-full items-center justify-center px-6"
      >
        <p className="text-center text-sm text-zinc-400 dark:text-zinc-500">
          اختر مهمة لعرض التفاصيل
        </p>
      </motion.div>
    );
  }

  const t = taskNotNull;
  const project = projects.find((p) => p.id === t.projectId);

  function handleBlur() {
    if (editTitle.trim() && editTitle.trim() !== t.title) {
      updateTask(t.id, { title: editTitle.trim() });
    }
  }

  return (
    <motion.div
      key={t.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col"
    >
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <h2 className="text-sm font-medium text-zinc-400 dark:text-zinc-500">التفاصيل</h2>
        <Button size="icon" onClick={() => setActiveTaskId(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleBlur}
          className="mb-4 w-full bg-transparent text-lg font-semibold text-zinc-900 outline-none dark:text-zinc-100"
        />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">الحالة</span>
            <button
              onClick={() => toggleComplete(t.id)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                t.completed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {t.completed ? 'مكتمل' : 'قيد التنفيذ'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">الأولوية</span>
            <div className="flex gap-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => updateTask(t.id, { priority: p.value as Priority })}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                    t.priority === p.value
                      ? p.color
                      : 'text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">تاريخ الاستحقاق</span>
            <input
              type="date"
              value={t.dueDate || ''}
              onChange={(e) => updateTask(t.id, { dueDate: e.target.value || undefined })}
              className="rounded-lg border border-zinc-200 bg-white/50 px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300"
            />
          </div>

          {project && (
            <div className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">المشروع</span>
              <span
                className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium leading-4"
                style={{ backgroundColor: project.color + '20', color: project.color }}
              >
                {project.name}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500">تاريخ الإنشاء</span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {new Date(t.createdAt).toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => toggleImportant(t.id)}>
            <Star className={cn('h-3.5 w-3.5', t.important && 'fill-amber-400 text-amber-400')} />
            {t.important ? 'مهمة' : 'مهمة'}
          </Button>
          <Button variant="danger" size="sm" onClick={() => deleteTask(t.id)}>
            <Trash2 className="h-3.5 w-3.5" /> حذف
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
