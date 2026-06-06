'use client';

import { cn } from '@/lib/cn';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { Button } from '@/components/ui/Button';
import { getToday } from '@/lib/constants';
import {
  LayoutDashboard,
  ListTodo,
  Calendar,
  Star,
  CheckCircle2,
  Plus,
  FolderKanban,
  Target,
<<<<<<< HEAD
  BrainCircuit,
} from 'lucide-react';

type View = 'app' | 'dashboard' | 'ai';
=======
} from 'lucide-react';

type View = 'app' | 'dashboard';
>>>>>>> aaba259eb43c2a33ef905f9dfe525f4f89bb0fce

const NAV_ITEMS = [
  { label: 'جميع المهام', icon: ListTodo, filter: 'all' as const },
  { label: 'اليوم', icon: Calendar, filter: 'today' as const },
  { label: 'المهمة', icon: Star, filter: 'important' as const },
  { label: 'المنجزة', icon: CheckCircle2, filter: 'completed' as const },
];

interface SidebarProps {
<<<<<<< HEAD
  view: 'app' | 'dashboard' | 'ai';
  onViewChange: (view: 'app' | 'dashboard' | 'ai') => void;
=======
  view: 'app' | 'dashboard';
  onViewChange: (view: 'app' | 'dashboard') => void;
>>>>>>> aaba259eb43c2a33ef905f9dfe525f4f89bb0fce
}

export function Sidebar({ view, onViewChange }: SidebarProps) {
  const { filter, setFilter, setActiveProjectId, activeProjectId, tasks } = useTaskStore();
  const { projects, addProject, deleteProject } = useProjectStore();
  const { darkMode, toggleDarkMode, toggleFocusMode, setSidebarOpen } = useUIStore();

  const todayStr = getToday();
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;

  const importantCount = tasks.filter((t) => t.important && !t.completed).length;

  function handleNavClick(fn: () => void) {
    fn();
    setSidebarOpen(false);
  }

  return (
<<<<<<< HEAD
    <aside className="flex h-full w-64 flex-col border-e border-zinc-200/60 bg-white/95 backdrop-blur-xl dark:border-zinc-800/40 dark:bg-gradient-to-b dark:from-[#0B0F1A] dark:to-[#0F1525]">
=======
    <aside className="flex h-full w-64 flex-col border-e border-zinc-200/60 bg-white/95 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/95">
>>>>>>> aaba259eb43c2a33ef905f9dfe525f4f89bb0fce
      <div className="flex items-center gap-2 px-4 pt-5 pb-4">
        <img src="/logo.svg" alt="My Taske" className="h-8 w-auto" />
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        <button
          onClick={() => handleNavClick(() => onViewChange('dashboard'))}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]',
            view === 'dashboard'
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="flex-1 text-start">لوحة التحكم</span>
        </button>

        <div className="my-2 border-t border-zinc-200/50 dark:border-zinc-800/50" />

        {NAV_ITEMS.map((item) => (
          <button
            key={item.filter}
            onClick={() => handleNavClick(() => {
              onViewChange('app');
              setFilter(item.filter);
            })}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]',
              filter === item.filter && !activeProjectId
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="flex-1 text-start">{item.label}</span>
            {item.filter === 'today' && todayCount > 0 && (
              <span className="text-[11px] text-zinc-400">{todayCount}</span>
            )}
            {item.filter === 'important' && importantCount > 0 && (
              <span className="text-[11px] text-zinc-400">{importantCount}</span>
            )}
          </button>
        ))}

<<<<<<< HEAD
        <button
          onClick={() => handleNavClick(() => onViewChange('ai'))}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]',
            view === 'ai'
              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
              : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
          )}
        >
          <BrainCircuit className="h-4 w-4" />
          <span className="flex-1 text-start">المساعد الذكي</span>
        </button>

=======
>>>>>>> aaba259eb43c2a33ef905f9dfe525f4f89bb0fce
        <div className="my-3 border-t border-zinc-200/50 dark:border-zinc-800/50" />

        <div className="mb-1 flex items-center justify-between px-3">
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            المشاريع
          </span>
          <Button
            size="icon"
            onClick={() => {
              const name = prompt('اسم المشروع:');
              if (name?.trim()) addProject(name.trim());
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {projects.map((project) => (
          <div key={project.id} className="group flex items-center">
            <button
              onClick={() => handleNavClick(() => {
                onViewChange('app');
                setActiveProjectId(project.id);
              })}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors min-h-[44px]',
                activeProjectId === project.id
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
              )}
            >
              <FolderKanban className="h-4 w-4" style={{ color: project.color }} />
              <span className="flex-1 text-start truncate">{project.name}</span>
            </button>
            <button
              onClick={() => {
                if (confirm(`هل تريد حذف "${project.name}"؟`)) {
                  deleteProject(project.id);
                }
              }}
              className="me-1 rounded p-2 text-zinc-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 md:p-1"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </nav>

<<<<<<< HEAD
      <div className="mx-2 mb-2 mt-auto rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-2 dark:border-zinc-800/40 dark:bg-zinc-900/40">
=======
      <div className="border-t border-zinc-200/60 px-2 py-3 dark:border-zinc-800/60">
>>>>>>> aaba259eb43c2a33ef905f9dfe525f4f89bb0fce
        <button
          onClick={toggleFocusMode}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors min-h-[44px] hover:bg-indigo-50 hover:text-indigo-600 dark:text-zinc-400 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400"
        >
          <Target className="h-4 w-4" />
          <span>وضع التركيز</span>
          <kbd className="me-auto rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">F</kbd>
        </button>
        <button
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors min-h-[44px] hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
        >
          {darkMode ? '☀️ فاتح' : '🌙 ليلي'}
        </button>
      </div>
    </aside>
  );
}
