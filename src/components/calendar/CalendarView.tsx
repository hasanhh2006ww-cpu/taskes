'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_NAMES = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export function CalendarView() {
  const tasks = useTaskStore((s) => s.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
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

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 md:text-xl">التقويم</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-zinc-700">
            {MONTH_NAMES[month]} {year}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl border border-zinc-200/60 bg-white shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-7 border-b border-zinc-100">
            {DAY_NAMES.map((d) => (
              <div key={d} className="py-3 text-center text-[11px] font-medium text-zinc-400">{d.slice(0, 2)}</div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <div key={`e-${di}`} className="min-h-24 border-b border-zinc-50" />;
                const dateStr = getDateStr(day);
                const dayTasks = getTasksForDay(day);
                const completedCount = dayTasks.filter(t => t.completed).length;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={day}
                    className={cn(
                      'min-h-24 border-b border-zinc-50 p-2 transition-colors hover:bg-zinc-50',
                      isToday && 'bg-emerald-50/50'
                    )}
                  >
                    <span className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday ? 'bg-emerald-500 text-white' : 'text-zinc-600'
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayTasks.slice(0, 3).map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            'truncate rounded px-1 py-0.5 text-[10px] leading-4',
                            t.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-600'
                          )}
                        >
                          {t.title}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] text-zinc-400 px-1">+{dayTasks.length - 3}</div>
                      )}
                    </div>
                    {dayTasks.length > 0 && (
                      <div className="mt-1 flex gap-0.5">
                        {Array.from({ length: Math.min(completedCount, 3) }).map((_, i) => (
                          <div key={i} className="h-1 w-1 rounded-full bg-emerald-400" />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
