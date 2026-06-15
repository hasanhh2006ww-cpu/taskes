'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { useHabitStore } from '@/store/useHabitStore';
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
  Flame,
  ChevronLeft,
  Settings,
} from 'lucide-react';

type View = 'app' | 'dashboard' | 'habits' | 'calendar' | 'settings';

const NAV_ITEMS = [
  { label: 'جميع المهام', icon: ListTodo, filter: 'all' as const },
  { label: 'اليوم', icon: Calendar, filter: 'today' as const },
  { label: 'المهمة', icon: Star, filter: 'important' as const },
  { label: 'المنجزة', icon: CheckCircle2, filter: 'completed' as const },
];

interface SidebarProps {
  view: View;
  onViewChange: (view: View) => void;
}

function NavTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute start-full top-1/2 z-50 ms-3 -translate-y-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-zinc-700">
      {label}
      <div className="absolute end-full top-1/2 -mt-1 -me-0.5 h-2 w-2 rotate-45 bg-zinc-900 dark:bg-zinc-700" />
    </div>
  );
}

export function Sidebar({ view, onViewChange }: SidebarProps) {
  const { filter, setFilter, setActiveProjectId, activeProjectId, tasks } = useTaskStore();
  const { projects, addProject, deleteProject } = useProjectStore();
  const { darkMode, toggleDarkMode, toggleFocusMode, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { habits } = useHabitStore();

  const todayStr = getToday();
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;
  const importantCount = tasks.filter((t) => t.important && !t.completed).length;

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  function handleNavClick(fn: () => void) {
    fn();
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  const isActive = (checkView: View, checkFilter?: string) =>
    checkFilter ? view === 'app' && filter === checkFilter && !activeProjectId : view === checkView;

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col border-e border-zinc-200/60 bg-white/95 backdrop-blur-xl overflow-hidden',
        'dark:border-zinc-800/40 dark:bg-gradient-to-b dark:from-[#0B0F1A] dark:to-[#0F1525]'
      )}
    >
      <div className={cn('flex items-center px-4 pt-5 pb-4', sidebarCollapsed ? 'justify-center' : 'justify-between')}>
        {!sidebarCollapsed && <img src="/logo.svg" alt="My Taske" className="h-8 w-auto" />}
        <button
          onClick={toggleSidebarCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        <div className="relative" onMouseEnter={() => setHoveredItem('dashboard')} onMouseLeave={() => setHoveredItem(null)}>
          <button
            onClick={() => handleNavClick(() => onViewChange('dashboard'))}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm transition-colors',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive('dashboard')
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-start">لوحة التحكم</span>}
          </button>
          <NavTooltip label="لوحة التحكم" show={sidebarCollapsed && hoveredItem === 'dashboard'} />
        </div>

        <div className="my-2 border-t border-zinc-200/50 dark:border-zinc-800/50" />

        {NAV_ITEMS.map((item) => (
          <div
            key={item.filter}
            className="relative"
            onMouseEnter={() => setHoveredItem(item.filter)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <button
              onClick={() => handleNavClick(() => {
                onViewChange('app');
                setFilter(item.filter);
              })}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg text-sm transition-colors',
                sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isActive('app', item.filter)
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span className="flex-1 text-start">{item.label}</span>}
              {!sidebarCollapsed && item.filter === 'today' && todayCount > 0 && (
                <span className="text-[11px] text-zinc-400">{todayCount}</span>
              )}
              {!sidebarCollapsed && item.filter === 'important' && importantCount > 0 && (
                <span className="text-[11px] text-zinc-400">{importantCount}</span>
              )}
            </button>
            <NavTooltip label={item.label} show={sidebarCollapsed && hoveredItem === item.filter} />
          </div>
        ))}

        <div className="my-3 border-t border-zinc-200/50 dark:border-zinc-800/50" />

        {!sidebarCollapsed && (
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
        )}

        {projects.map((project) => (
          <div
            key={project.id}
            className="group relative"
            onMouseEnter={() => setHoveredItem(`project-${project.id}`)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className={cn('flex items-center', sidebarCollapsed && 'justify-center')}>
              <button
                onClick={() => handleNavClick(() => {
                  onViewChange('app');
                  setActiveProjectId(project.id);
                })}
                className={cn(
                  'flex items-center gap-3 rounded-lg text-sm transition-colors',
                  sidebarCollapsed
                    ? 'justify-center px-2 py-2.5'
                    : 'flex-1 px-3 py-2.5',
                  activeProjectId === project.id
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
                )}
              >
                <FolderKanban className="h-4 w-4 shrink-0" style={{ color: project.color }} />
                {!sidebarCollapsed && <span className="flex-1 text-start truncate">{project.name}</span>}
              </button>
              {!sidebarCollapsed && (
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
              )}
            </div>
            <NavTooltip label={project.name} show={sidebarCollapsed && hoveredItem === `project-${project.id}`} />
          </div>
        ))}

        <div className="my-3 border-t border-zinc-200/50 dark:border-zinc-800/50" />

        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('calendar')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={() => handleNavClick(() => onViewChange('calendar'))}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm transition-colors',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive('calendar')
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-start">التقويم</span>}
          </button>
          <NavTooltip label="التقويم" show={sidebarCollapsed && hoveredItem === 'calendar'} />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('settings')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={() => handleNavClick(() => onViewChange('settings'))}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm transition-colors',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive('settings')
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-start">الإعدادات</span>}
          </button>
          <NavTooltip label="الإعدادات" show={sidebarCollapsed && hoveredItem === 'settings'} />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('habits')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={() => handleNavClick(() => onViewChange('habits'))}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm transition-colors',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActive('habits')
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <Flame className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span className="flex-1 text-start">العادات</span>}
            {!sidebarCollapsed && habits.length > 0 && <span className="text-[11px] text-zinc-400">{habits.length}</span>}
          </button>
          <NavTooltip label="العادات" show={sidebarCollapsed && hoveredItem === 'habits'} />
        </div>
      </nav>

      <div className={cn('mx-2 mb-2 mt-auto rounded-xl border border-zinc-200/50 p-2 dark:border-zinc-800/40', sidebarCollapsed ? 'bg-transparent' : 'bg-zinc-50/50 dark:bg-zinc-900/40')}>
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('focus')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={toggleFocusMode}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm transition-colors text-zinc-500 dark:text-zinc-400',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              'hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'
            )}
          >
            <Target className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-start">وضع التركيز</span>
                <kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500">F</kbd>
              </>
            )}
          </button>
          <NavTooltip label="وضع التركيز" show={sidebarCollapsed && hoveredItem === 'focus'} />
        </div>
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('theme')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={toggleDarkMode}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg text-sm transition-colors text-zinc-500 dark:text-zinc-400',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
            )}
          >
            {sidebarCollapsed ? (darkMode ? '☀️' : '🌙') : (darkMode ? '☀️ فاتح' : '🌙 ليلي')}
          </button>
          <NavTooltip label={darkMode ? 'الوضع الفاتح' : 'الوضع الليلي'} show={sidebarCollapsed && hoveredItem === 'theme'} />
        </div>
      </div>
    </aside>
  );
}
