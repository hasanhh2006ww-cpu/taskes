'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useHabitStore } from '@/store/useHabitStore';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/cn';
import { getToday } from '@/lib/constants';
import { useProjectStore } from '@/store/useProjectStore';
import { TaskDetail } from '@/components/tasks/TaskDetail';
import { getHabitIcon } from '@/lib/habitIcons';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  ListTodo,
  Flame,
  Target,
  FolderKanban,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

type ViewMode = 'month' | 'week' | 'day' | 'agenda';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const DAY_NAMES_SHORT = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const PRIORITY_LABELS: Record<string, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
};

function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatTime(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

export function CalendarView() {
  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const habits = useHabitStore((s) => s.habits);
  const toggleComplete = useTaskStore((s) => s.toggleComplete);
  const projects = useProjectStore((s) => s.projects);
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const setActiveTaskId = useTaskStore((s) => s.setActiveTaskId);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newProjectId, setNewProjectId] = useState<string | undefined>(undefined);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const modalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showModal && modalInputRef.current) {
      setTimeout(() => modalInputRef.current?.focus(), 50);
    }
  }, [showModal]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const todayStr = getToday();

  function handleTaskClick(taskId: string) {
    logger.info(`Calendar: task clicked ${taskId}`);
    setActiveTaskId(taskId);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const weeks = useMemo(() => {
    const cells: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        cells.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      cells.push(week);
    }
    return cells;
  }, [firstDayOfMonth, daysInMonth]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, typeof tasks> = {};
    tasks.forEach((t) => {
      if (t.dueDate) {
        if (!map[t.dueDate]) map[t.dueDate] = [];
        map[t.dueDate].push(t);
      }
    });
    return map;
  }, [tasks]);

  const habitsByDate = useMemo(() => {
    const map: Record<string, typeof habits> = {};
    habits.forEach((h) => {
      if (h.type === 'daily') {
        const dates = Object.keys((h as any).completions).filter((d) => (h as any).completions[d]);
        dates.forEach((d) => {
          if (!map[d]) map[d] = [];
          map[d].push(h);
        });
      }
    });
    return map;
  }, [habits]);

  function getTasksForDate(dateStr: string) {
    return tasksByDate[dateStr] || [];
  }

  function getHabitsForDate(dateStr: string) {
    return habitsByDate[dateStr] || [];
  }

  function navigate(direction: 1 | -1) {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + direction, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7 * direction);
      setCurrentDate(d);
    } else if (viewMode === 'day') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + direction);
      setCurrentDate(d);
    }
    setSelectedDate(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }

  function openCreateModal(dateStr: string) {
    setModalDate(dateStr);
    setNewTitle('');
    setNewPriority('medium');
    setNewProjectId(undefined);
    setNewStartTime('09:00');
    setNewEndTime('10:00');
    setShowModal(true);
  }

  function handleCreateTask() {
    if (!newTitle.trim()) return;
    const newId = addTask({
      title: newTitle.trim(),
      priority: newPriority,
      projectId: newProjectId,
      dueDate: modalDate,
    });
    setActiveTaskId(newId);
    logger.info(`Calendar: created task "${newTitle.trim()}" on ${modalDate}`);
    setShowModal(false);
    setNewTitle('');
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  }

  function handleDayDoubleClick(dateStr: string) {
    openCreateModal(dateStr);
  }

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const headerTitle = useMemo(() => {
    if (viewMode === 'month') return `${MONTH_NAMES[month]} ${year}`;
    if (viewMode === 'week') {
      const start = weekDays[0];
      const end = weekDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${end.getDate()}`;
      }
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} - ${MONTH_NAMES[end.getMonth()]} ${end.getDate()}`;
    }
    if (viewMode === 'day') {
      return `${DAY_NAMES[currentDate.getDay()]}، ${currentDate.getDate()} ${MONTH_NAMES[month]} ${year}`;
    }
    return '';
  }, [viewMode, year, month, weekDays, currentDate]);

  function handleViewChange(view: ViewMode) {
    logger.info(`Calendar: switching to ${view} view`);
    setViewMode(view);
  }

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur-md dark:border-zinc-800/40 dark:bg-zinc-950/80 md:px-4">
        <button
          onClick={goToToday}
          className="rounded-lg border border-zinc-200/60 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:bg-zinc-800 md:text-sm"
        >
          اليوم
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 md:h-8 md:w-8"
            aria-label="السابق"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => navigate(1)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 md:h-8 md:w-8"
            aria-label="التالي"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
        <h2 className="min-w-0 flex-1 text-base font-semibold text-zinc-800 dark:text-zinc-200 md:text-lg">
          {headerTitle}
        </h2>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200/60 bg-zinc-50 p-0.5 dark:border-zinc-700/60 dark:bg-zinc-900">
          {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map((view) => (
            <button
              key={view}
              onClick={() => handleViewChange(view)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-all md:px-3 md:text-sm',
                viewMode === view
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
            >
              {view === 'month' ? 'شهر' : view === 'week' ? 'أسبوع' : view === 'day' ? 'يوم' : 'جدول'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {viewMode === 'month' && (
            <MonthView
              year={year}
              month={month}
              weeks={weeks}
              todayStr={todayStr}
              selectedDate={selectedDate}
              activeTaskId={activeTaskId}
              getTasksForDate={getTasksForDate}
              getHabitsForDate={getHabitsForDate}
              onDayClick={handleDayClick}
              onDayDoubleClick={handleDayDoubleClick}
              onTaskClick={handleTaskClick}
              formatDateStr={formatDateStr}
            />
          )}
          {viewMode === 'week' && (
            <WeekView
              weekDays={weekDays}
              todayStr={todayStr}
              selectedDate={selectedDate}
              activeTaskId={activeTaskId}
              getTasksForDate={getTasksForDate}
              getHabitsForDate={getHabitsForDate}
              onDayClick={handleDayClick}
              onDayDoubleClick={handleDayDoubleClick}
              onTaskClick={handleTaskClick}
            />
          )}
          {viewMode === 'day' && (
            <DayView
              currentDate={currentDate}
              todayStr={todayStr}
              getTasksForDate={getTasksForDate}
              getHabitsForDate={getHabitsForDate}
              onDayDoubleClick={handleDayDoubleClick}
              toggleComplete={toggleComplete}
              onTaskClick={handleTaskClick}
              tasks={tasks}
            />
          )}
          {viewMode === 'agenda' && (
            <AgendaView
              tasks={tasks}
              todayStr={todayStr}
              getTasksForDate={getTasksForDate}
              toggleComplete={toggleComplete}
              onTaskClick={handleTaskClick}
              activeTaskId={activeTaskId}
            />
          )}
        </div>
        {/* Right panel: task detail, day summary, or default content */}
        <CalendarRightPanel
          activeTaskId={activeTaskId}
          selectedDate={selectedDate}
          tasks={tasks}
          habits={habits}
          projects={projects}
          getTasksForDate={getTasksForDate}
          getHabitsForDate={getHabitsForDate}
          onCloseTask={() => setActiveTaskId(null)}
          onCloseDay={() => setSelectedDate(null)}
          onCreateTask={() => selectedDate && openCreateModal(selectedDate)}
          onQuickAddTask={() => openCreateModal(getToday())}
          onQuickViewDay={() => { setCurrentDate(new Date(getToday())); setViewMode('day'); }}
          onTaskClick={handleTaskClick}
          toggleComplete={toggleComplete}
          currentDate={currentDate}
          onDateSelect={(d) => { setCurrentDate(d); setViewMode('month'); }}
        />
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <CreateEventModal
            modalDate={modalDate}
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newPriority={newPriority}
            setNewPriority={setNewPriority}
            newStartTime={newStartTime}
            setNewStartTime={setNewStartTime}
            newEndTime={newEndTime}
            setNewEndTime={setNewEndTime}
            handleCreateTask={handleCreateTask}
            onClose={() => setShowModal(false)}
            inputRef={modalInputRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MonthView({
  year, month, weeks, todayStr, selectedDate, activeTaskId, getTasksForDate, getHabitsForDate, onDayClick, onDayDoubleClick, onTaskClick, formatDateStr,
}: {
  year: number; month: number; weeks: (number | null)[][]; todayStr: string; selectedDate: string | null; activeTaskId: string | null;
  getTasksForDate: (d: string) => any[]; getHabitsForDate: (d: string) => any[];
  onDayClick: (d: string) => void; onDayDoubleClick: (d: string) => void; onTaskClick: (id: string) => void;
  formatDateStr: (y: number, m: number, d: number) => string;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b border-zinc-200/60 bg-zinc-50/80 dark:border-zinc-800/40 dark:bg-zinc-900/80">
        {DAY_NAMES.map((d, i) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 md:py-2.5 md:text-sm">
            <span className="hidden md:inline">{d}</span>
            <span className="md:hidden">{DAY_NAMES_SHORT[i]}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-1 border-b border-zinc-100/60 last:border-b-0 dark:border-zinc-800/30">
            {week.map((day, di) => {
              if (!day) return <div key={`e-${wi}-${di}`} className="flex-1 border-e border-zinc-100/60 last:border-e-0 dark:border-zinc-800/30" />;
              const dateStr = formatDateStr(year, month, day);
              const dayTasks = getTasksForDate(dateStr);
              const dayHabits = getHabitsForDate(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = selectedDate === dateStr;
              const isWeekend = di === 5 || di === 6;
              return (
                <button
                  key={day}
                  onClick={() => onDayClick(dateStr)}
                  onDoubleClick={() => onDayDoubleClick(dateStr)}
                  className={cn(
                    'group relative flex flex-1 flex-col border-e border-zinc-100/60 p-1 text-start transition-colors last:border-e-0 dark:border-zinc-800/30',
                    isSelected && 'bg-emerald-50/60 dark:bg-emerald-900/20',
                    isToday && 'bg-emerald-50/30 dark:bg-emerald-900/10',
                    !isSelected && !isToday && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20',
                    isWeekend && 'bg-zinc-50/50 dark:bg-zinc-900/30'
                  )}
                >
                  <div className="mb-auto flex items-center justify-between">
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium md:h-7 md:w-7 md:text-sm',
                      isToday && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
                      isSelected && !isToday && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/50 dark:text-emerald-400',
                      !isSelected && !isToday && 'text-zinc-600 dark:text-zinc-400'
                    )}>
                      {day}
                    </span>
                    <span
                      onClick={(e) => { e.stopPropagation(); onDayDoubleClick(dateStr); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onDayDoubleClick(dateStr); } }}
                      role="button"
                      tabIndex={0}
                      className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-zinc-200 group-hover:opacity-100 dark:hover:bg-zinc-700"
                    >
                      <Plus className="h-3 w-3 text-zinc-400" />
                    </span>
                  </div>
                  <div className="mt-0.5 space-y-0.5">
                    {dayTasks.slice(0, 3).map((t: any) => (
                      <div
                        key={t.id}
                        onClick={(e) => { e.stopPropagation(); onTaskClick(t.id); }}
                        className={cn(
                          'flex cursor-pointer items-center gap-1 rounded-md border-r-4 px-1.5 py-0.5 text-[10px] font-medium leading-tight transition-all duration-200 md:text-xs',
                          t.completed
                            ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-500'
                            : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125',
                          activeTaskId === t.id && 'ring-2 ring-emerald-400 dark:ring-emerald-500'
                        )}
                      >
                        <span className="truncate">{t.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="px-1 text-[10px] font-medium text-zinc-400 dark:text-zinc-500">
                        +{dayTasks.length - 3} أكثر
                      </div>
                    )}
                    {dayTasks.length === 0 && dayHabits.length === 0 && (
                      <div className="h-4" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekView({
  weekDays, todayStr, selectedDate, activeTaskId, getTasksForDate, getHabitsForDate, onDayClick, onDayDoubleClick, onTaskClick,
}: {
  weekDays: Date[]; todayStr: string; selectedDate: string | null; activeTaskId: string | null;
  getTasksForDate: (d: string) => any[]; getHabitsForDate: (d: string) => any[];
  onDayClick: (d: string) => void; onDayDoubleClick: (d: string) => void; onTaskClick: (id: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="grid grid-cols-7 border-b border-zinc-200/60 bg-zinc-50/80 dark:border-zinc-800/40 dark:bg-zinc-900/80">
        {weekDays.map((d, i) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          return (
            <div key={i} className="py-2 text-center md:py-2.5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{DAY_NAMES_SHORT[i]}</div>
              <div className={cn(
                'mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium md:h-8 md:w-8',
                isToday && 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30',
                !isToday && 'text-zinc-600 dark:text-zinc-400'
              )}>
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-14 shrink-0 flex-col border-e border-zinc-200/60 dark:border-zinc-800/40">
          {HOURS.map((h) => (
            <div key={h} className="flex h-16 items-start justify-end border-b border-zinc-100/60 px-2 pt-0.5 dark:border-zinc-800/30">
              <span className="text-[10px] text-zinc-400">{formatTime(h)}</span>
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-7 overflow-y-auto">
          {weekDays.map((d, di) => {
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            const dayTasks = getTasksForDate(dateStr);
            const isToday = dateStr === todayStr;
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={di}
                onClick={() => onDayClick(dateStr)}
                onDoubleClick={() => onDayDoubleClick(dateStr)}
                className={cn(
                  'relative border-e border-zinc-100/60 last:border-e-0 dark:border-zinc-800/30',
                  isSelected && 'bg-emerald-50/60 dark:bg-emerald-900/20',
                  isToday && 'bg-emerald-50/30 dark:bg-emerald-900/10',
                  !isSelected && !isToday && 'hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                )}
              >
                {HOURS.map((h) => (
                  <div key={h} className="h-16 border-b border-zinc-100/60 dark:border-zinc-800/30" />
                ))}
                {dayTasks.map((t: any) => {
                  const taskHour = 9;
                  const topOffset = taskHour * 64;
                  return (
                    <div
                      key={t.id}
                      className={cn(
                        'absolute start-1 end-1 overflow-hidden rounded-md border-r-4 px-1.5 py-1 text-xs font-medium leading-tight shadow-sm transition-all duration-200 md:start-1.5 md:end-1.5',
                        t.completed
                          ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-500'
                          : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125'
                      )}
                      style={{ top: `${topOffset}px`, height: '60px' }}
                    >
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayView({
  currentDate, todayStr, getTasksForDate, getHabitsForDate, onDayDoubleClick, toggleComplete, onTaskClick, tasks,
}: {
  currentDate: Date; todayStr: string; getTasksForDate: (d: string) => any[]; getHabitsForDate: (d: string) => any[];
  onDayDoubleClick: (d: string) => void; toggleComplete: (id: string) => void; onTaskClick: (id: string) => void; tasks: any[];
}) {
  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const dayTasks = getTasksForDate(dateStr);
  const dayHabits = getHabitsForDate(dateStr);
  const isToday = dateStr === todayStr;

  return (
    <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-14 shrink-0 flex-col border-e border-zinc-200/60 dark:border-zinc-800/40">
          {HOURS.map((h) => (
            <div key={h} className="flex h-16 items-start justify-end border-b border-zinc-100/60 px-2 pt-0.5 dark:border-zinc-800/30">
              <span className="text-[10px] text-zinc-400">{formatTime(h)}</span>
            </div>
          ))}
        </div>
        <div
          className="relative flex-1 overflow-y-auto"
          onDoubleClick={() => onDayDoubleClick(dateStr)}
        >
          {HOURS.map((h) => (
            <div key={h} className="h-16 border-b border-zinc-100/60 dark:border-zinc-800/30" />
          ))}
          {dayTasks.map((t: any) => {
            const taskHour = 9;
            const topOffset = taskHour * 64;
            return (
              <div
                key={t.id}
                onClick={(e) => { e.stopPropagation(); onTaskClick(t.id); }}
                className={cn(
                  'absolute start-2 end-2 cursor-pointer overflow-hidden rounded-md border-r-4 px-3 py-2 shadow-sm transition-all duration-200 hover:shadow-md',
                  t.completed
                    ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-500'
                    : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125'
                )}
                style={{ top: `${topOffset}px`, minHeight: '56px' }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={(e) => { e.stopPropagation(); toggleComplete(t.id); }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-zinc-300"
                  />
                  <span className="truncate text-sm font-medium">{t.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full shrink-0 border-t border-zinc-200/60 bg-white p-4 dark:border-zinc-800/40 dark:bg-zinc-900/60 md:w-72 md:border-t-0 md:border-s">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {isToday ? 'اليوم' : DAY_NAMES[currentDate.getDay()]}
          </h3>
          <span className="text-xs text-zinc-400">{currentDate.getDate()} {MONTH_NAMES[currentDate.getMonth()]}</span>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">المهام ({dayTasks.length})</h4>
          {dayTasks.length === 0 && (
            <p className="text-xs text-zinc-400">لا توجد مهام في هذا اليوم</p>
          )}
          {dayTasks.map((t: any) => (
            <div
              key={t.id}
              onClick={(e) => { e.stopPropagation(); onTaskClick(t.id); }}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border-r-4 px-2 py-1.5 text-xs font-medium transition-all duration-200',
                t.completed
                  ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-500'
                  : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125'
              )}
            >
              <span className="flex-1 truncate">{t.title}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">العادات ({dayHabits.length})</h4>
          {dayHabits.length === 0 && (
            <p className="text-xs text-zinc-400">لا توجد عادات في هذا اليوم</p>
          )}
          {dayHabits.map((h: any) => {
            const HIcon = getHabitIcon(h.icon);
            const hColor = h.color || '#f59e0b';
            return (
              <div key={h.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                <HIcon className="h-3 w-3 shrink-0" style={{ color: hColor }} />
                <span className="flex-1 truncate text-xs">{h.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AgendaView({
  tasks, todayStr, getTasksForDate, toggleComplete, onTaskClick, activeTaskId,
}: {
  tasks: any[]; todayStr: string; getTasksForDate: (d: string) => any[]; toggleComplete: (id: string) => void; onTaskClick: (id: string) => void; activeTaskId: string | null;
}) {
  const upcomingDays = useMemo(() => {
    const days: { date: string; tasks: any[] }[] = [];
    const today = new Date(todayStr);
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayTasks = getTasksForDate(dateStr);
      if (dayTasks.length > 0) {
        days.push({ date: dateStr, tasks: dayTasks });
      }
    }
    return days;
  }, [tasks, todayStr, getTasksForDate]);

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <h3 className="mb-4 text-sm font-semibold text-zinc-700 dark:text-zinc-300">الأيام القادمة</h3>
        {upcomingDays.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo className="mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-400">لا توجد مهام قادمة</p>
            <p className="mt-1 text-xs text-zinc-400">أضف مهاماً جديدة لرؤيتها هنا</p>
          </div>
        )}
        <div className="space-y-4">
          {upcomingDays.map(({ date, tasks: dayTasks }) => {
            const d = new Date(date);
            const isToday = date === todayStr;
            const dayName = isToday ? 'اليوم' : d.getDate() === new Date(todayStr).getDate() + 1 ? 'غداً' : DAY_NAMES[d.getDay()];
            return (
              <div key={date}>
                <div className="mb-2 flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', isToday ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600')} />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                    {dayName}، {d.getDate()} {MONTH_NAMES[d.getMonth()]}
                  </span>
                </div>
                <div className="space-y-1">
                  {dayTasks.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={(e) => { e.stopPropagation(); onTaskClick(t.id); }}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border-r-4 px-3 py-2.5 shadow-sm transition-all duration-200',
                        t.completed
                          ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30'
                          : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125',
                        activeTaskId === t.id && 'ring-2 ring-emerald-400 dark:ring-emerald-500'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={(e) => { e.stopPropagation(); toggleComplete(t.id); }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 cursor-pointer rounded border-zinc-300"
                      />
                      <span className="flex-1 text-sm font-medium">{t.title}</span>
                      <span className="rounded bg-teal-100/60 px-1.5 py-0.5 text-[10px] font-medium text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                        {PRIORITY_LABELS[t.priority] || t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarRightPanel({
  activeTaskId, selectedDate, tasks, habits, projects,
  getTasksForDate, getHabitsForDate,
  onCloseTask, onCloseDay, onCreateTask, toggleComplete,
  currentDate, onDateSelect, onTaskClick,
  onQuickAddTask, onQuickViewDay,
}: {
  activeTaskId: string | null;
  selectedDate: string | null;
  tasks: any[];
  habits: any[];
  projects: any[];
  getTasksForDate: (d: string) => any[];
  getHabitsForDate: (d: string) => any[];
  onCloseTask: () => void;
  onCloseDay: () => void;
  onCreateTask: () => void;
  toggleComplete: (id: string) => void;
  currentDate: Date;
  onDateSelect: (d: Date) => void;
  onTaskClick: (id: string) => void;
  onQuickAddTask: () => void;
  onQuickViewDay: () => void;
}) {
  {/* Active task → show TaskDetail as fixed drawer */}
  if (activeTaskId) {
    logger.info('CalendarRightPanel: showing TaskDetail');
    return <TaskDetail />;
  }

  {/* Selected date → show day summary */}
  if (selectedDate) {
    const d = new Date(selectedDate);
    const isToday = selectedDate === getToday();
    const dayTasks = getTasksForDate(selectedDate);
    const dayHabits = getHabitsForDate(selectedDate);

    return (
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 280, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="hidden overflow-y-auto border-s border-zinc-200/60 bg-white dark:border-zinc-800/40 dark:bg-zinc-900/60 md:block"
      >
        <div className="flex items-center justify-between border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/40">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {isToday ? 'اليوم' : DAY_NAMES[d.getDay()]}
            </p>
            <p className="text-xs text-zinc-400">{d.getDate()} {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</p>
          </div>
          <button onClick={onCloseDay} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">المهام ({dayTasks.length})</h4>
            <button
              onClick={onCreateTask}
              className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600"
            >
              <Plus className="h-3 w-3" />
              جديد
            </button>
          </div>
          {dayTasks.length === 0 && (
            <p className="py-6 text-center text-xs text-zinc-400">لا توجد مهام في هذا اليوم</p>
          )}
          <div className="space-y-1">
            {dayTasks.map((t: any) => (
              <div
                key={t.id}
                onClick={() => onTaskClick(t.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border-r-4 px-2 py-1.5 text-xs font-medium transition-all duration-200',
                  t.completed
                    ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-500'
                    : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125'
                )}
              >
                <input
                  type="checkbox"
                  checked={t.completed}
                  onChange={(e) => { e.stopPropagation(); toggleComplete(t.id); }}
                  onClick={(e) => e.stopPropagation()}
                  className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded border-zinc-300"
                />
                <span className="flex-1 truncate">{t.title}</span>
              </div>
            ))}
          </div>

          {dayHabits.length > 0 && (
            <>
              <div className="mb-3 mt-6 border-t border-zinc-100 pt-4 dark:border-zinc-800" />
              <h4 className="mb-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">العادات ({dayHabits.length})</h4>
              <div className="space-y-1.5">
                {dayHabits.map((h: any) => {
                  const HIcon = getHabitIcon(h.icon);
                  const hColor = h.color || '#f59e0b';
                  return (
                    <div key={h.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                      <HIcon className="h-3 w-3 shrink-0" style={{ color: hColor }} />
                      <span className="flex-1 truncate text-xs">{h.title}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </motion.div>
    );
  }

  {/* Nothing selected → Today's Tasks + Mini Calendar + Quick Actions */}
  const todayStr = getToday();
  const todayAllTasks = getTasksForDate(todayStr);
  const overdueTasks = tasks.filter((t: any) => t.date && t.date < todayStr && !t.completed);
  const todayUpcoming = todayAllTasks.filter((t: any) => !t.completed);
  const todayHabits = getHabitsForDate(todayStr);

  {/* Mini calendar helpers */}
  const mcYear = currentDate.getFullYear();
  const mcMonth = currentDate.getMonth();
  const mcFirstDay = new Date(mcYear, mcMonth, 1).getDay();
  const mcDaysInMonth = new Date(mcYear, mcMonth + 1, 0).getDate();
  const mcToday = new Date(todayStr);
  const mcWeeks: (number | null)[][] = [];
  let mcDay: (number | null)[] = [];
  for (let i = 0; i < mcFirstDay; i++) mcDay.push(null);
  for (let d = 1; d <= mcDaysInMonth; d++) {
    mcDay.push(d);
    if (mcDay.length === 7) { mcWeeks.push(mcDay); mcDay = []; }
  }
  if (mcDay.length > 0) { while (mcDay.length < 7) mcDay.push(null); mcWeeks.push(mcDay); }

  function handlePrevMonth() {
    const prev = new Date(mcYear, mcMonth - 1, 1);
    onDateSelect(prev);
  }
  function handleNextMonth() {
    const next = new Date(mcYear, mcMonth + 1, 1);
    onDateSelect(next);
  }

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 280, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="hidden overflow-y-auto border-s border-zinc-200/60 bg-white dark:border-zinc-800/40 dark:bg-zinc-900/60 md:block"
    >
      <div className="space-y-6 p-4">
        {/* Today's Tasks */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">مهام اليوم</h4>
            <span className="me-auto text-[10px] text-zinc-400">{todayStr}</span>
          </div>
          {overdueTasks.length > 0 && (
            <div className="mb-2 rounded-lg bg-red-50 px-3 py-2 dark:bg-red-950/20">
              <p className="text-[10px] font-medium text-red-500 dark:text-red-400">{overdueTasks.length} مهام متأخرة</p>
            </div>
          )}
          {todayUpcoming.length === 0 && overdueTasks.length === 0 && (
            <p className="py-3 text-center text-xs text-zinc-400">لا توجد مهام لليوم</p>
          )}
          <div className="space-y-1">
            {[...overdueTasks, ...todayUpcoming].slice(0, 6).map((t: any) => (
              <div
                key={t.id}
                onClick={() => onTaskClick(t.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-md border-r-4 px-2 py-1.5 text-xs font-medium transition-all',
                  t.completed
                    ? 'border-zinc-300 bg-zinc-50 text-zinc-400 line-through dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-500'
                    : 'border-teal-500 bg-teal-50 text-teal-700 hover:brightness-95 dark:border-teal-400 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:brightness-125'
                )}
              >
                <span className="flex-1 truncate">{t.title}</span>
                {t.date && t.date < todayStr && !t.completed && (
                  <span className="shrink-0 rounded bg-red-100 px-1 py-0.5 text-[9px] text-red-500 dark:bg-red-900/30 dark:text-red-400">متأخر</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mini Calendar */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <button onClick={handlePrevMonth} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              {MONTH_NAMES[mcMonth]} {mcYear}
            </span>
            <button onClick={handleNextMonth} className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-0 text-center">
            {DAY_NAMES_SHORT.map((dn) => (
              <div key={dn} className="py-1 text-[9px] font-medium text-zinc-400">{dn}</div>
            ))}
            {mcWeeks.flat().map((d, i) => {
              const isTodayCell = d !== null && d === mcToday.getDate() && mcMonth === mcToday.getMonth() && mcYear === mcToday.getFullYear();
              return (
                <div
                  key={i}
                  className={cn(
                    'py-1 text-[11px] transition-colors',
                    d === null ? '' : 'cursor-pointer rounded hover:bg-zinc-100 dark:hover:bg-zinc-800',
                    isTodayCell ? 'rounded bg-emerald-500 font-semibold text-white' : 'text-zinc-600 dark:text-zinc-400'
                  )}
                  onClick={() => {
                    if (d !== null) {
                      const target = new Date(mcYear, mcMonth, d);
                      target.setHours(12);
                      onDateSelect(target);
                    }
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">إجراءات سريعة</h4>
          </div>
          <div className="space-y-2">
            <button
              onClick={onQuickAddTask}
              className="flex w-full items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            >
              <Plus className="h-3.5 w-3.5" />
              إضافة مهمة
            </button>
            <button
              onClick={onQuickViewDay}
              className="flex w-full items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:bg-zinc-800/30 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
            >
              <Calendar className="h-3.5 w-3.5" />
              عرض اليوم
            </button>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-500 dark:bg-zinc-800/30 dark:text-zinc-400">
              <FolderKanban className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1">مشاريع نشطة</span>
              <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {projects.filter((p: any) => p.isActive !== false).length}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Habits summary */}
        {todayHabits.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">عادات اليوم</h4>
            </div>
            <div className="space-y-1">
              {todayHabits.slice(0, 4).map((h: any) => {
                const HIcon = getHabitIcon(h.icon);
                const hColor = h.color || '#f59e0b';
                return (
                  <div key={h.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                    <HIcon className="h-3 w-3 shrink-0" style={{ color: hColor }} />
                    <span className="flex-1 truncate text-xs">{h.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CreateEventModal({
  modalDate, newTitle, setNewTitle, newPriority, setNewPriority,
  newStartTime, setNewStartTime, newEndTime, setNewEndTime,
  handleCreateTask, onClose, inputRef,
}: {
  modalDate: string; newTitle: string; setNewTitle: (v: string) => void;
  newPriority: 'low' | 'medium' | 'high'; setNewPriority: (v: 'low' | 'medium' | 'high') => void;
  newStartTime: string; setNewStartTime: (v: string) => void;
  newEndTime: string; setNewEndTime: (v: string) => void;
  handleCreateTask: () => void; onClose: () => void; inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const d = new Date(modalDate);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-md rounded-2xl border border-zinc-200/60 bg-white shadow-xl dark:border-zinc-700/60 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">مهمة جديدة</h3>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{DAY_NAMES[d.getDay()]}، {d.getDate()} {MONTH_NAMES[d.getMonth()]} {d.getFullYear()}</span>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان المهمة..."
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500"
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTask(); }}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">الأولوية</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewPriority(p)}
                    className={cn(
                      'flex-1 rounded-lg border py-1.5 text-xs font-medium transition-all',
                      newPriority === p
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600 dark:border-emerald-500 dark:bg-emerald-900/20 dark:text-emerald-400'
                        : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800'
                    )}
                  >
                    {PRIORITY_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">وقت البداية</label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-500 dark:text-zinc-400">وقت النهاية</label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3.5 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            إلغاء
          </button>
          <button
            onClick={handleCreateTask}
            disabled={!newTitle.trim()}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
          >
            إنشاء
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
