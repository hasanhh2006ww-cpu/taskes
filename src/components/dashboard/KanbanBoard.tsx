'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

type TaskStatus = 'todo' | 'in-progress' | 'done';

interface KanbanTask {
  id: string;
  title: string;
  time?: string;
  tag?: { label: string; color: string; bg: string };
  completed?: boolean;
  status?: TaskStatus;
}

interface ColumnDef {
  id: TaskStatus;
  title: string;
  emoji: string;
  bgClass: string;
  badgeClass: string;
  borderClass: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: 'todo',
    title: 'للعمل',
    emoji: '📋',
    bgClass: 'bg-gray-50 dark:bg-zinc-900/40',
    badgeClass: 'bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-zinc-300',
    borderClass: 'border-gray-200 dark:border-zinc-700',
  },
  {
    id: 'in-progress',
    title: 'قيد العمل',
    emoji: '⚡',
    bgClass: 'bg-amber-50/60 dark:bg-amber-950/20',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-900/40',
  },
  {
    id: 'done',
    title: 'تم',
    emoji: '✅',
    bgClass: 'bg-emerald-50/60 dark:bg-emerald-950/20',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-900/40',
  },
];

const MOCK_TASKS: KanbanTask[] = [
  {
    id: '1',
    title: 'إنهاء تقرير المشروع',
    time: '10:00 ص',
    tag: { label: 'عمل', color: '#4F7CFF', bg: '#4F7CFF15' },
    status: 'todo',
  },
  {
    id: '2',
    title: 'مراجعة كود الفريق',
    time: '11:30 ص',
    tag: { label: 'عاجل', color: '#EF4444', bg: '#EF444415' },
    status: 'todo',
  },
  {
    id: '3',
    title: 'تصميم واجهة المستخدم',
    time: '02:00 م',
    tag: { label: 'تصميم', color: '#8B5CF6', bg: '#8B5CF615' },
    status: 'in-progress',
  },
  {
    id: '4',
    title: 'مراجعة البريد الإلكتروني',
    time: '03:30 م',
    tag: { label: 'روتيني', color: '#F59E0B', bg: '#F59E0B15' },
    status: 'in-progress',
  },
  {
    id: '5',
    title: 'تحديث وثائق المشروع',
    time: '09:00 ص',
    tag: { label: 'مكتمل', color: '#10B981', bg: '#10B98115' },
    status: 'done',
    completed: true,
  },
  {
    id: '6',
    title: 'إعداد عرض تقديمي',
    time: '08:00 ص',
    tag: { label: 'مكتمل', color: '#10B981', bg: '#10B98115' },
    status: 'done',
    completed: true,
  },
];

function TaskCard({ task, index }: { task: KanbanTask; index: number }) {
  const [isChecked, setIsChecked] = useState(!!task.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn(
        'group cursor-pointer rounded-lg border bg-white p-3 transition-all duration-200',
        'border-gray-100 hover:border-emerald-300',
        'dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500',
        isChecked && 'opacity-60'
      )}
      style={{ boxShadow: 'none' }}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          {task.tag && (
            <span
              className="mb-1.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: task.tag.bg, color: task.tag.color }}
            >
              {task.tag.label}
            </span>
          )}
          <p
            className={cn(
              'text-sm font-bold text-zinc-800 transition-all dark:text-zinc-200',
              isChecked && 'text-gray-400 line-through dark:text-zinc-600'
            )}
          >
            {task.title}
          </p>
          {task.time && (
            <div className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400 dark:text-zinc-500">
              <Clock className="h-3 w-3" />
              <span>{task.time}</span>
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsChecked(!isChecked);
          }}
          aria-label={isChecked ? 'إلغاء إكمال المهمة' : 'إكمال المهمة'}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
            isChecked
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-gray-300 hover:border-emerald-400 dark:border-zinc-600 dark:hover:border-emerald-500'
          )}
        >
          {isChecked && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      </div>
    </motion.div>
  );
}

interface KanbanColumnProps {
  column: ColumnDef;
  tasks: KanbanTask[];
}

function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-dashed p-3',
        column.bgClass,
        column.borderClass
      )}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{column.emoji}</span>
          <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            {column.title}
          </h4>
        </div>
        <span
          className={cn(
            'flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-[11px] font-bold',
            column.badgeClass
          )}
        >
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.map((task, idx) => (
          <TaskCard key={task.id} task={task} index={idx} />
        ))}
        {tasks.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 px-3 py-6 text-center text-xs text-gray-400 dark:border-zinc-700 dark:text-zinc-500">
            لا توجد مهام
          </div>
        )}
      </div>

      {adding ? (
        <motion.input
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          autoFocus
          onBlur={() => setAdding(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') setAdding(false);
            if (e.key === 'Escape') setAdding(false);
          }}
          placeholder="عنوان المهمة..."
          className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs text-zinc-800 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-zinc-900 dark:text-zinc-200"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 bg-white/50 px-3 py-2 text-xs font-medium text-emerald-600 transition-all hover:border-emerald-400 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-emerald-400 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/30"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>إضافة مهمة</span>
        </button>
      )}
    </div>
  );
}

export function KanbanBoard() {
  const tasksByColumn = COLUMNS.reduce(
    (acc, col) => {
      acc[col.id] = MOCK_TASKS.filter((t) => t.status === col.id);
      return acc;
    },
    {} as Record<TaskStatus, KanbanTask[]>
  );

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            مهام اليوم
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {MOCK_TASKS.filter((t) => !t.completed).length} مهمة نشطة
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
          📅 اليوم
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((column, idx) => (
          <motion.div
            key={column.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.08, ease: 'easeOut' }}
          >
            <KanbanColumn column={column} tasks={tasksByColumn[column.id] || []} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
