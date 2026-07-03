'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { useHabitStore } from '@/store/useHabitStore';
import { Button } from '@/components/ui/Button';
import { getToday } from '@/lib/constants';
import { logger } from '@/lib/logger';
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
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

function NavTooltip({ label, show }: { label: string; show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute start-full top-1/2 z-50 ms-3 -translate-y-1/2 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white  dark:bg-zinc-700">
      {label}
      <div className="absolute end-full top-1/2 -mt-1 -me-0.5 h-2 w-2 rotate-45 bg-zinc-900 dark:bg-zinc-700" />
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { filter, setFilter, setActiveProjectId, activeProjectId, tasks } = useTaskStore();
  const { projects, addProject, deleteProject } = useProjectStore();
  const { darkMode, themeMode, toggleDarkMode, toggleFocusMode, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { habits } = useHabitStore();

  const todayStr = getToday();
  const todayCount = tasks.filter((t) => t.dueDate === todayStr && !t.completed).length;
  const importantCount = tasks.filter((t) => t.important && !t.completed).length;

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  function closeSidebar() {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }

  function handleTaskNav(filterType: 'all' | 'today' | 'important' | 'completed') {
    setFilter(filterType);
    closeSidebar();
  }

  function handleProjectNav(projectId: string) {
    setActiveProjectId(projectId);
    closeSidebar();
  }

  const isTasksPage = pathname === '/' || pathname === '/tasks';
  const isActivePath = (p: string) => {
    if (p === '/') return pathname === '/';
    return pathname.startsWith(p);
  };

  const isFilterActive = (f: string) => isTasksPage && filter === f && !activeProjectId;

  return (
    <aside
      className={cn(
        'flex h-full w-full flex-col overflow-hidden  rounded-2xl',
        sidebarCollapsed ? 'items-center' : '',
        'glass-card'
      )}
    >
      <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center gap-1 px-1 py-3' : 'justify-between px-4 pt-4 pb-3')}>
        <Link
          href="/dashboard"
          onClick={() => { logger.info('Sidebar brand clicked, navigating to /dashboard'); closeSidebar(); }}
          className={cn(
            'group flex items-center transition-all duration-200',
            sidebarCollapsed ? '' : 'flex-1 gap-3'
          )}
          aria-label="الانتقال إلى لوحة التحكم"
        >
          <img
            src="/v1.png"
            alt="Stilldo"
            className={cn(
              'shrink-0 rounded-xl transition-all duration-200 group-hover:scale-105 group-hover:',
              sidebarCollapsed ? 'h-9 w-9' : 'h-12 w-12'
            )}
          />
          {!sidebarCollapsed && (
            <span className="text-xl font-extrabold tracking-wide text-zinc-800 transition-colors duration-200 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
              Stilldo
            </span>
          )}
        </Link>
        <button
          onClick={toggleSidebarCollapsed}
          className="flex h-11 w-11 md:h-8 md:w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          aria-label={sidebarCollapsed ? 'توسيع القائمة' : 'طي القائمة'}
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', sidebarCollapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        <div className="relative" onMouseEnter={() => setHoveredItem('dashboard')} onMouseLeave={() => setHoveredItem(null)}>
          <Link
            href="/dashboard"
            onClick={closeSidebar}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActivePath('/dashboard')
                ? 'bg-emerald-50 text-emerald-600  dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <LayoutDashboard className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isActivePath('/dashboard') && 'scale-110')} />
            {!sidebarCollapsed && <span className="flex-1 text-start">لوحة التحكم</span>}
          </Link>
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
            <Link
              href="/tasks"
              onClick={(e) => {
                handleTaskNav(item.filter);
              }}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
                sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                isFilterActive(item.filter)
                  ? 'bg-emerald-50 text-emerald-600  dark:bg-emerald-950/40 dark:text-emerald-400'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
              )}
            >
              <item.icon className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isFilterActive(item.filter) && 'scale-110')} />
              {!sidebarCollapsed && <span className="flex-1 text-start">{item.label}</span>}
              {!sidebarCollapsed && item.filter === 'today' && todayCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">{todayCount}</span>
              )}
              {!sidebarCollapsed && item.filter === 'important' && importantCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[10px] font-medium text-amber-600 dark:bg-amber-900/50 dark:text-amber-400">{importantCount}</span>
              )}
            </Link>
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
              <Link
                href="/tasks"
                onClick={() => handleProjectNav(project.id)}
                className={cn(
                  'group flex items-center gap-3 rounded-xl text-sm transition-all duration-200',
                  sidebarCollapsed
                    ? 'justify-center px-2 py-2.5'
                    : 'flex-1 px-3 py-2.5',
                  activeProjectId === project.id
                    ? 'bg-emerald-50 text-emerald-600  dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
                )}
              >
                <div className="relative">
                  <div className={cn('h-2 w-2 rounded-full', activeProjectId === project.id ? 'bg-emerald-500' : '')} style={{ backgroundColor: activeProjectId === project.id ? undefined : project.color }} />
                </div>
                {!sidebarCollapsed && <span className="flex-1 text-start truncate">{project.name}</span>}
              </Link>
              {!sidebarCollapsed && (
                <button
                  onClick={() => {
                    if (confirm(`هل تريد حذف "${project.name}"؟`)) {
                      deleteProject(project.id);
                    }
                  }}
                  className="me-1 rounded p-2.5 text-zinc-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100 dark:text-zinc-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 md:p-1"
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
          <Link
            href="/calendar"
            onClick={closeSidebar}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActivePath('/calendar')
                ? 'bg-emerald-50 text-emerald-600  dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <Calendar className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isActivePath('/calendar') && 'scale-110')} />
            {!sidebarCollapsed && <span className="flex-1 text-start">التقويم</span>}
          </Link>
          <NavTooltip label="التقويم" show={sidebarCollapsed && hoveredItem === 'calendar'} />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('settings')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/settings"
            onClick={closeSidebar}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActivePath('/settings')
                ? 'bg-emerald-50 text-emerald-600  dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <Settings className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isActivePath('/settings') && 'scale-110')} />
            {!sidebarCollapsed && <span className="flex-1 text-start">الإعدادات</span>}
          </Link>
          <NavTooltip label="الإعدادات" show={sidebarCollapsed && hoveredItem === 'settings'} />
        </div>

        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('habits')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Link
            href="/habits"
            onClick={closeSidebar}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              isActivePath('/habits')
                ? 'bg-emerald-50 text-emerald-600  dark:bg-emerald-950/40 dark:text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            <Flame className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isActivePath('/habits') && 'scale-110')} />
            {!sidebarCollapsed && <span className="flex-1 text-start">العادات</span>}
            {!sidebarCollapsed && habits.length > 0 && <span className="text-[11px] text-zinc-400">{habits.length}</span>}
          </Link>
          <NavTooltip label="العادات" show={sidebarCollapsed && hoveredItem === 'habits'} />
        </div>
      </nav>

      <div className={cn('mx-2 mb-2 mt-auto', sidebarCollapsed ? '' : 'glass rounded-xl p-2')}>
        <div
          className="relative"
          onMouseEnter={() => setHoveredItem('focus')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <button
            onClick={toggleFocusMode}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              'text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400'
            )}
          >
            <Target className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
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
              'group flex w-full items-center gap-3 rounded-xl text-sm transition-all duration-200',
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
              'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
            )}
          >
            {themeMode === 'dark' ? <Moon className="h-4 w-4 shrink-0" /> : themeMode === 'auto' ? <Monitor className="h-4 w-4 shrink-0" /> : <Sun className="h-4 w-4 shrink-0" />}
            {!sidebarCollapsed && <span>{themeMode === 'dark' ? 'داكن' : themeMode === 'auto' ? 'تلقائي' : 'فاتح'}</span>}
          </button>
          <NavTooltip label={themeMode === 'dark' ? 'الوضع الداكن' : themeMode === 'auto' ? 'الوضع التلقائي' : 'الوضع الفاتح'} show={sidebarCollapsed && hoveredItem === 'theme'} />
        </div>
      </div>
    </aside>
  );
}

const NAV_ITEMS = [
  { label: 'جميع المهام', icon: ListTodo, filter: 'all' as const },
  { label: 'اليوم', icon: Calendar, filter: 'today' as const },
  { label: 'المهمة', icon: Star, filter: 'important' as const },
  { label: 'المنجزة', icon: CheckCircle2, filter: 'completed' as const },
];
