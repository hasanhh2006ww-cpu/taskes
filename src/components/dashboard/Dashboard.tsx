'use client';

import { useMemo, useCallback } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { getToday, PRIORITIES } from '@/lib/constants';
import { cn } from '@/lib/cn';
import {
  ListTodo, Calendar, CheckCircle2, Clock,
  Search, Bell, Plus, Inbox, BarChart3,
  ArrowRight, Leaf, Sprout,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAY_NAMES_SHORT = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const DAY_NAMES_LONG = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const priorityColor: Record<string, { dot: string; bg: string }> = {
  low: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-600' },
  medium: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-600' },
  high: { dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-600' },
};

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${DAY_NAMES_LONG[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function WeekChart({ days }: { days: { label: string; total: number; done: number }[] }) {
  const maxVal = Math.max(...days.map(d => d.total), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-28 pt-2">
      {days.map((day, i) => {
        const totalH = Math.max((day.total / maxVal) * 100, day.done > 0 ? 8 : 0);
        const doneH = day.done > 0 ? (day.done / day.total) * totalH : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: `${Math.max(totalH, doneH)}%` }}>
              {day.total > 0 && (
                <div className="absolute bottom-0 w-full flex flex-col-reverse items-center">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-300 to-emerald-200 transition-all duration-500"
                    style={{ height: `${totalH > 0 ? totalH : 0}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                  />
                  <div
                    className="absolute bottom-0 w-1/2 rounded-t-md bg-gradient-to-t from-green-500 to-emerald-400 transition-all duration-500"
                    style={{ height: `${doneH > 0 ? doneH : 0}%`, minHeight: day.done > 0 ? '4px' : '0' }}
                  />
                </div>
              )}
            </div>
            <span className="text-[10px] font-medium text-zinc-400">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

interface DashboardProps {
  onViewChange?: (view: 'app' | 'dashboard' | 'habits') => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const { setActiveProjectId } = useTaskStore();

  const today = getToday();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const todayCount = tasks.filter((t) => t.dueDate === today).length;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && !t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const recentTasks = useMemo(() =>
    [...tasks].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    [tasks]
  );

  const weekDays = useMemo(() => {
    const days: { label: string; total: number; done: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayTasks = tasks.filter(t => t.dueDate === dateStr);
      days.push({
        label: DAY_NAMES_SHORT[d.getDay()],
        total: dayTasks.length,
        done: dayTasks.filter(t => t.completed).length,
      });
    }
    return days;
  }, [tasks]);

  const goToTasks = useCallback(() => {
    onViewChange?.('app');
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('[data-task-input]')?.focus();
    }, 100);
  }, [onViewChange]);

  const goToTasksWithProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    onViewChange?.('app');
  }, [onViewChange, setActiveProjectId]);

  const statsCards = [
    {
      label: 'إجمالي المهام', value: total, icon: ListTodo,
      gradient: 'from-emerald-500/10 to-emerald-50', iconBg: 'bg-emerald-500', iconColor: 'text-white',
      progress: total > 0 ? 100 : 0, progressColor: 'bg-emerald-500',
    },
    {
      label: 'مهام اليوم', value: todayCount, icon: Calendar,
      gradient: 'from-green-400/10 to-green-50', iconBg: 'bg-green-500', iconColor: 'text-white',
      progress: total > 0 ? Math.round((todayCount / Math.max(total, 1)) * 100) : 0, progressColor: 'bg-green-500',
    },
    {
      label: 'مكتملة', value: completed, icon: CheckCircle2,
      gradient: 'from-emerald-600/10 to-emerald-50', iconBg: 'bg-emerald-600', iconColor: 'text-white',
      progress: completionRate, progressColor: 'bg-emerald-600',
    },
    {
      label: 'معلقة', value: pending, icon: Clock,
      gradient: 'from-amber-500/10 to-amber-50', iconBg: 'bg-amber-500', iconColor: 'text-white',
      progress: pending > 0 ? Math.round((pending / Math.max(total, 1)) * 100) : 0, progressColor: 'bg-amber-500',
    },
  ];

  const isEmpty = total === 0;

  return (
    <div className="flex h-full flex-col bg-zinc-50">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md"
      >
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              placeholder="ابحث عن مهمة..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pe-4 ps-9 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.success('🔔 لا توجد إشعارات جديدة')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-[13px] font-bold text-white shadow-sm">
              <Leaf className="h-4 w-4" />
            </div>
            <button
              onClick={goToTasks}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:shadow-md hover:shadow-emerald-500/30 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">إضافة مهمة</span>
            </button>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 md:px-6 md:py-8">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm">
                <Sprout className="h-12 w-12 text-emerald-400" />
              </div>
              <h2 className="mb-2 text-xl font-bold text-zinc-900">ابدأ رحلة الإنجاز</h2>
              <p className="mb-6 text-sm text-zinc-400">أنشئ أول مهمة لك وابدأ في تنظيم يومك</p>
              <button
                onClick={goToTasks}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95"
              >
                إنشاء أول مهمة
              </button>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
              <motion.div variants={itemVariants}>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-zinc-900">مرحباً بعودتك!</h1>
                  <Sprout className="h-6 w-6 text-emerald-400" />
                </div>
                <p className="text-sm text-zinc-400">
                  {todayCount > 0
                    ? `لديك ${todayCount} مهام اليوم، ${completed} مكتملة إجمالاً`
                    : 'يوم هادئ، استغل الوقت لإنجاز المزيد'}
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {statsCards.map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                    className={cn(
                      'relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-4 shadow-sm transition-shadow',
                      'hover:shadow-md'
                    )}
                  >
                    <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', stat.gradient)} />
                    <div className="relative">
                      <div className="mb-3 flex items-center justify-between">
                        <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl shadow-sm', stat.iconBg)}>
                          <stat.icon className={cn('h-[18px] w-[18px]', stat.iconColor)} />
                        </div>
                        <span className="text-2xl font-bold text-zinc-900">{stat.value}</span>
                      </div>
                      <span className="text-xs font-medium text-zinc-500">{stat.label}</span>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className={cn('h-full rounded-full transition-all duration-500', stat.progressColor)}
                          style={{ width: `${stat.progress}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">المهام الأخيرة</h3>
                    <button
                      onClick={goToTasks}
                      className="text-[10px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      عرض الكل <ArrowRight className="me-0.5 inline h-3 w-3" />
                    </button>
                  </div>
                  {recentTasks.length === 0 ? (
                    <p className="py-6 text-center text-xs text-zinc-400">لا توجد مهام بعد</p>
                  ) : (
                    <div className="space-y-1">
                      {recentTasks.map((task, i) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.25 }}
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-emerald-50/50"
                        >
                          <div className={cn('h-2 w-2 shrink-0 rounded-full', priorityColor[task.priority]?.dot || 'bg-zinc-300')} />
                          <span className={cn(
                            'flex-1 truncate text-sm',
                            task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'
                          )}>
                            {task.title}
                          </span>
                          {task.dueDate && (
                            <span className="shrink-0 text-[10px] text-zinc-400">
                              {getDateLabel(task.dueDate)}
                            </span>
                          )}
                          <span className={cn(
                            'shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium',
                            task.completed
                              ? 'bg-emerald-50 text-emerald-600'
                              : priorityColor[task.priority]?.bg || 'bg-zinc-100 text-zinc-600'
                          )}>
                            {task.completed ? 'تم' : PRIORITIES.find(p => p.value === task.priority)?.label || task.priority}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-zinc-900">المشاريع</h3>
                    <span className="text-[10px] font-medium text-zinc-400">{projects.length} مشروع</span>
                  </div>
                  {projects.length === 0 ? (
                    <p className="py-6 text-center text-xs text-zinc-400">لا توجد مشاريع بعد</p>
                  ) : (
                    <div className="space-y-3">
                      {projects.map((p) => {
                        const count = tasks.filter((t) => t.projectId === p.id).length;
                        const done = tasks.filter((t) => t.projectId === p.id && t.completed).length;
                        const pct = count > 0 ? Math.round((done / count) * 100) : 0;
                        return (
                          <motion.button
                            key={p.id}
                            onClick={() => goToTasksWithProject(p.id)}
                            whileHover={{ x: 3 }}
                            className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 p-3 text-start transition-colors hover:bg-emerald-50/50"
                          >
                            <div className="mb-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="text-sm font-medium text-zinc-800">{p.name}</span>
                              </div>
                              <span className="text-[10px] font-medium text-zinc-400">{done}/{count}</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-200">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, backgroundColor: p.color }}
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {overdue > 0 && (
                <motion.div variants={itemVariants}>
                  <div className="rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50 to-rose-50/50 p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100">
                        <Clock className="h-4 w-4 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-rose-700">
                          {overdue} {overdue === 1 ? 'مهمة متأخرة' : 'مهام متأخرة'}
                        </p>
                        <p className="text-xs text-rose-500">تحتاج إلى مراجعة فورية</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <div className="rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <h3 className="text-sm font-semibold text-zinc-900">النشاط الأسبوعي</h3>
                  </div>
                  <WeekChart days={weekDays} />
                  <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-emerald-300" />
                      <span>المهام المجدولة</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-green-500" />
                      <span>المكتملة</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
