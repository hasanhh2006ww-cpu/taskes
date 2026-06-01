'use client';

import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { ListTodo, Calendar, CheckCircle2, AlertCircle, FolderKanban } from 'lucide-react';

export function Dashboard() {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);

  const today = new Date().toISOString().split('T')[0];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const todayCount = tasks.filter((t) => t.dueDate === today).length;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && !t.completed).length;
  const pending = total - completed;

  const stats = [
    { label: 'Total Tasks', value: total, icon: ListTodo, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Today', value: todayCount, icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Pending', value: pending, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-5 pb-3">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Quick overview of your tasks</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border border-zinc-200/60 p-4 backdrop-blur-sm dark:border-zinc-800/60 ${stat.bg}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  {stat.label}
                </span>
              </div>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-zinc-200/60 p-4 dark:border-zinc-800/60">
          <div className="mb-3 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-zinc-400" />
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">Projects</span>
            <span className="text-xs text-zinc-300 dark:text-zinc-600">{projects.length}</span>
          </div>
          {projects.length === 0 ? (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No projects yet</p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => {
                const count = tasks.filter((t) => t.projectId === p.id).length;
                const done = tasks.filter((t) => t.projectId === p.id && t.completed).length;
                return (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="flex-1 text-zinc-700 dark:text-zinc-300">{p.name}</span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {done}/{count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {overdue > 0 && (
          <div className="mt-3 rounded-2xl border border-rose-200/60 bg-rose-50/50 p-3 dark:border-rose-900/30 dark:bg-rose-950/20">
            <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
              {overdue} overdue task{overdue !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
