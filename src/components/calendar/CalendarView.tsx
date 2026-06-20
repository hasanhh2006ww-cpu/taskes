'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export function CalendarView() {
  const tasks = useTaskStore((s) => s.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const weeks = useMemo(() => {
    const cells: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) week.push(null);
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
  }, [firstDay, daysInMonth]);

  function getDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getTasksForDay(day: number) {
    const dateStr = getDateStr(day);
    return tasks.filter(t => t.dueDate === dateStr);
  }

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = selectedDay ? getDateStr(selectedDay) : null;
  const selectedTasks = selectedDate ? getTasksForDay(selectedDay!) : [];

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-transparent">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">التقويم</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden dark:border-zinc-800/40 dark:bg-zinc-900/60"
        >
          {/* Month Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-2.5 text-center text-[11px] font-medium text-zinc-400">{d.slice(0, 2)}</div>
            ))}
          </div>

          {/* Day Grid */}
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <div key={`e-${di}`} className="min-h-[72px] border-b border-zinc-50 dark:border-zinc-800/30" />;
                const dateStr = getDateStr(day);
                const dayTasks = getTasksForDay(day);
                const completedCount = dayTasks.filter(t => t.completed).length;
                const isToday = dateStr === today;
                const isSelected = selectedDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={cn(
                      'min-h-[72px] border-b border-zinc-50 p-1.5 transition-all duration-150 text-start',
                      'hover:bg-zinc-50 dark:border-zinc-800/30 dark:hover:bg-zinc-800/30',
                      isSelected && 'bg-emerald-50/50 dark:bg-emerald-900/20',
                      isToday && 'bg-emerald-50/30 dark:bg-emerald-900/10'
                    )}
                  >
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all',
                      isToday
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : isSelected
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/50 dark:text-emerald-400'
                          : 'text-zinc-600 dark:text-zinc-400'
                    )}>
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-0.5">
                        {dayTasks.slice(0, 3).map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              t.completed ? 'bg-emerald-400' : 'bg-zinc-300 dark:bg-zinc-600'
                            )}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[9px] text-zinc-400 me-0.5">+{dayTasks.length - 3}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </motion.div>

        {/* Selected Day Tasks */}
        <AnimatePresence>
          {selectedTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm dark:border-zinc-800/40 dark:bg-zinc-900/60"
            >
              <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                مهام {selectedDay} {MONTH_NAMES[month]}
              </h3>
              <div className="space-y-2">
                {selectedTasks.map((t) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                      t.completed ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/30'
                    )}
                  >
                    <div className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      t.completed ? 'bg-emerald-400' : 'bg-zinc-300 dark:bg-zinc-600'
                    )} />
                    <span className={cn(
                      'flex-1 truncate text-sm',
                      t.completed ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-200'
                    )}>
                      {t.title}
                    </span>
                    {t.completed && (
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">تم</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedTasks.length === 0 && selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-zinc-200/60 bg-white p-6 text-center shadow-sm dark:border-zinc-800/40 dark:bg-zinc-900/60"
          >
            <p className="text-sm text-zinc-400">لا توجد مهام في هذا اليوم</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
