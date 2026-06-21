'use client';

import { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useUIStore } from '@/store/useUIStore';
import { getToday, getWeekKey, PRIORITIES } from '@/lib/constants';
import { cn } from '@/lib/cn';
import {
  ListTodo, Calendar, CheckCircle2, Clock,
  Search, Bell, Plus, BarChart3,
  ArrowRight, Sprout, Target,
  Timer, Flame, TrendingUp,
  FolderKanban, Sparkles, SunDim, Moon,
  Brain, Activity,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DAY_NAMES_SHORT = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const DAY_NAMES_LONG = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const QUOTES = [
  'النجاح ليس غياب الفشل، بل الاستمرار رغم الفشل',
  'لا تؤجل عمل اليوم إلى الغد',
  'الانضباط هو الجسر بين الأهداف والإنجاز',
  'كل مهمة تنجزها هي خطوة نحو هدفك الأكبر',
  'ابدأ حيث أنت، واستخدم ما لديك، وافعل ما تستطيع',
];

const priorityColor: Record<string, { dot: string; bg: string }> = {
  low: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 text-emerald-600' },
  medium: { dot: 'bg-amber-500', bg: 'bg-amber-50 text-amber-600' },
  high: { dot: 'bg-rose-500', bg: 'bg-rose-50 text-rose-600' },
};

function getDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `${DAY_NAMES_LONG[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function getGreeting(): { text: string; icon: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'صباح الخير', icon: '☀️' };
  if (hour < 17) return { text: 'مساء الخير', icon: '🌤️' };
  return { text: 'مساء الخير', icon: '🌙' };
}

function getArabicDate(): string {
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const d = new Date();
  return `${days[d.getDay()]}، ${d.getDate()} ${months[d.getMonth()]}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}س ${m}د` : `${h}س`;
}

function WeekChart({ days }: { days: { label: string; total: number; done: number }[] }) {
  const maxVal = Math.max(...days.map(d => d.total), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
      {days.map((day, i) => {
        const totalH = Math.max((day.total / maxVal) * 100, day.done > 0 ? 8 : 0);
        const doneH = day.done > 0 ? (day.done / day.total) * totalH : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: `${Math.max(totalH, doneH)}%` }}>
              {day.total > 0 && (
                <div className="absolute bottom-0 w-full flex flex-col-reverse items-center">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-200 to-emerald-100 transition-all duration-500"
                    style={{ height: `${totalH > 0 ? totalH : 0}%`, minHeight: day.total > 0 ? '4px' : '0' }}
                  />
                  <div
                    className="absolute bottom-0 w-1/2 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
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

function ProgressRing({ percent, size = 96, strokeWidth = 6, color }: { percent: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(percent, 100) / 100);
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: dashOffset }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
}

function AnimatedProgressBar({ value, max, color = 'emerald' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full rounded-full', `bg-gradient-to-r from-${color}-400 to-${color}-500`)}
      />
    </div>
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function ProductivityScoreCard({ score, maxScore = 100 }: { score: number; maxScore?: number }) {
  const ringColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'ممتاز' : score >= 50 ? 'جيد' : 'بحاجة للتحسين';
  return (
    <motion.div variants={itemVariants} className="card-hover card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent" />
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/20">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">معدل الإنتاجية</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProgressRing percent={score} size={72} strokeWidth={5} color={ringColor} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{score}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{label}</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">من أصل {maxScore} نقطة</p>
            <AnimatedProgressBar value={score} max={maxScore} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WeeklyHeatmapView({ weeks }: { weeks: { label: string; days: { date: string; count: number; completed: number }[] }[] }) {
  const maxCount = Math.max(...weeks.flatMap(w => w.days.map(d => d.count)), 1);
  return (
    <motion.div variants={itemVariants} className="card-hover card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 shadow-sm shadow-amber-500/20">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">خريطة النشاط الأسبوعي</h3>
        </div>
        <div className="flex gap-1.5">
          {weeks.map((week) => (
            <div key={week.label} className="flex flex-1 flex-col gap-1">
              {week.days.map((day) => {
                const intensity = maxCount > 0 ? day.count / maxCount : 0;
                const bg = day.count === 0
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : day.completed === day.count
                    ? 'bg-emerald-500'
                    : intensity > 0.66
                      ? 'bg-emerald-400'
                      : intensity > 0.33
                        ? 'bg-emerald-300'
                        : 'bg-emerald-200';
                return (
                  <div
                    key={day.date}
                    className={cn('h-3 w-full rounded-sm transition-colors', bg)}
                    title={`${day.date}: ${day.completed}/${day.count}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-zinc-400">
          <span>أقل</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-200" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-300" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span>أكثر</span>
        </div>
      </div>
    </motion.div>
  );
}

function FocusSummaryCard({ totalPomodoros, focusMinutes, todayPomodoros }: { totalPomodoros: number; focusMinutes: number; todayPomodoros: number }) {
  return (
    <motion.div variants={itemVariants} className="card-hover card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
      <div className="relative">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 shadow-sm shadow-violet-500/20">
            <Timer className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">ملخص التركيز</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{totalPomodoros}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">إجمالي الجلسات</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{formatDuration(focusMinutes)}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">إجمالي الوقت</p>
          </div>
          <div className="rounded-xl bg-zinc-50 p-3 text-center dark:bg-zinc-800/50">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{todayPomodoros}</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">جلسات اليوم</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TodayTasksCard({ tasks, onToggle, onNavigate }: { tasks: { id: string; title: string; priority: string; completed: boolean }[]; onToggle: (id: string) => void; onNavigate: () => void }) {
  if (tasks.length === 0) {
    return (
      <motion.div variants={itemVariants} className="card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
              <ListTodo className="h-4 w-4 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">مهام اليوم</h3>
          </div>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-400">لا توجد مهام لليوم</p>
      </motion.div>
    );
  }
  return (
    <motion.div variants={itemVariants} className="card-hover card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 shadow-sm shadow-sky-500/20">
            <ListTodo className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">مهام اليوم</h3>
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-medium text-sky-600 dark:bg-sky-900/30 dark:text-sky-400">{tasks.length}</span>
        </div>
        <button onClick={onNavigate} className="text-[10px] font-medium text-sky-600 transition-colors hover:text-sky-700 cursor-pointer">
          عرض الكل <ArrowRight className="me-0.5 inline h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1.5">
        {tasks.map((task) => (
          <motion.button
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => onToggle(task.id)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
          >
            <div className={cn(
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
              task.completed
                ? 'border-emerald-500 bg-emerald-500'
                : 'border-zinc-300 dark:border-zinc-600'
            )}>
              {task.completed && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
            </div>
            <span className={cn(
              'flex-1 truncate text-sm',
              task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200'
            )}>
              {task.title}
            </span>
            <div className={cn('h-2 w-2 rounded-full', priorityColor[task.priority]?.dot || 'bg-zinc-300')} />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const router = useRouter();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const { setActiveProjectId, toggleComplete } = useTaskStore();

  const habits = useHabitStore((s) => s.habits);
  const { toggleFocusMode, darkMode, toggleDarkMode } = useUIStore();

  const today = getToday();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const todayCount = tasks.filter((t) => t.dueDate === today).length;
  const todayCompleted = tasks.filter((t) => t.dueDate === today && t.completed).length;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && !t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalPomodoros = tasks.reduce((sum, t) => sum + t.pomodoroCount, 0);

  const todayTasks = useMemo(() =>
    tasks.filter((t) => t.dueDate === today && !t.completed).slice(0, 8),
    [tasks, today]
  );

  const todayHabitCompletions = useMemo(() => {
    return habits.filter((h) => {
      if (h.type === 'daily') return h.completions[today] === true;
      if (h.type === 'weekly') {
        return h.completedWeeks[getWeekKey(today)] === true;
      }
      return false;
    }).length;
  }, [habits, today]);

  const focusMinutes = useMemo(() => totalPomodoros * 25, [totalPomodoros]);

  const productivityScore = useMemo(() => {
    const taskScore = total > 0 ? (completed / total) * 40 : 0;
    const habitScore = habits.length > 0 ? (todayHabitCompletions / habits.length) * 30 : 0;
    const focusScore = Math.min(totalPomodoros * 2, 30);
    return Math.round(taskScore + habitScore + focusScore);
  }, [total, completed, habits.length, todayHabitCompletions, totalPomodoros]);

  const habitStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => h.streak || 0));
  }, [habits]);

  const habitCompletionRate = useMemo(() => {
    if (habits.length === 0) return 0;
    const completedHabits = habits.filter((h) => {
      if (h.type === 'daily') return h.completions?.[today] === true;
      return false;
    });
    return Math.round((completedHabits.length / Math.max(habits.length, 1)) * 100);
  }, [habits]);

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

  const heatmapWeeks = useMemo(() => {
    const weeks: { label: string; days: { date: string; count: number; completed: number }[] }[] = [];
    for (let w = 3; w >= 0; w--) {
      const days: { date: string; count: number; completed: number }[] = [];
      for (let d = 6; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - (w * 7 + d));
        const dateStr = date.toISOString().split('T')[0];
        const dayTasks = tasks.filter(t => t.dueDate === dateStr);
        days.push({
          date: dateStr,
          count: dayTasks.length,
          completed: dayTasks.filter(t => t.completed).length,
        });
      }
      weeks.push({ label: `أسبوع ${w + 1}`, days });
    }
    return weeks;
  }, [tasks]);

  const todayPomodoros = useMemo(() => {
    return tasks.filter(t => t.dueDate === today).reduce((sum, t) => sum + t.pomodoroCount, 0);
  }, [tasks, today]);

  const goToTasks = useCallback(() => {
    router.push('/');
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('[data-task-input]')?.focus();
    }, 100);
  }, [router]);

  const goToTasksWithProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    router.push('/');
  }, [router, setActiveProjectId]);

  const handleToggleTodayTask = useCallback((taskId: string) => {
    toggleComplete(taskId);
    toast.success('تم تحديث المهمة');
  }, [toggleComplete]);

  const isEmpty = total === 0;
  const greeting = getGreeting();
  const dailyQuote = QUOTES[new Date().getDate() % QUOTES.length];

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-transparent">
      <div className="sticky top-0 z-10 border-b border-zinc-200/60 bg-white/80 backdrop-blur-md dark:border-zinc-800/40 dark:bg-zinc-950/60">
        <div className="flex items-center gap-3 px-4 py-3 md:px-6">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              placeholder="ابحث عن مهمة..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pe-4 ps-9 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-emerald-600"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleDarkMode}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
              aria-label={darkMode ? 'الوضع الفاتح' : 'الوضع الليلي'}
            >
              {darkMode ? <SunDim className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <button
              onClick={() => toast.success('🔔 لا توجد إشعارات جديدة')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            >
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-[13px] font-bold text-white shadow-sm">
              <span>م</span>
            </div>
            <button
              onClick={goToTasks}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/20 transition-all hover:shadow-md hover:shadow-emerald-500/30 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">إضافة مهمة</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 md:p-6">
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-6 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm dark:from-emerald-900/20 dark:to-emerald-800/20"
              >
                <Sprout className="h-14 w-14 text-emerald-400" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <h2 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">ابدأ رحلة الإنجاز</h2>
                <p className="mb-8 text-sm text-zinc-400">أنشئ أول مهمة لك وابدأ في تنظيم يومك</p>
              </motion.div>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToTasks}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
              >
                إنشاء أول مهمة
              </motion.button>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-10 grid grid-cols-2 gap-4 md:flex md:gap-6"
              >
                {[
                  { icon: CheckCircle2, label: 'إدارة المهام', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                  { icon: FolderKanban, label: 'المشاريع', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/30' },
                  { icon: Timer, label: 'جلسات التركيز', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                  { icon: Flame, label: 'العادات', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', feature.bg)}>
                      <feature.icon className={cn('h-[18px] w-[18px]', feature.color)} />
                    </div>
                    <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{feature.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
              {/* Responsive Grid: 1 col mobile, 2 col tablet/desktop (layout sidebar = 3rd col on desktop) */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* --- LEFT COLUMN --- */}
                <div className="space-y-5">
                  <ProductivityScoreCard score={productivityScore} />
                  <WeeklyHeatmapView weeks={heatmapWeeks} />
                  <FocusSummaryCard totalPomodoros={totalPomodoros} focusMinutes={focusMinutes} todayPomodoros={todayPomodoros} />

                  {/* Recent Activity */}
                  <motion.div variants={itemVariants} className="card-hover card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
                    <div className="relative">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm shadow-emerald-500/20">
                            <Clock className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">النشاط الأخير</h3>
                        </div>
                        <button onClick={goToTasks} className="text-[10px] font-medium text-emerald-600 transition-colors hover:text-emerald-700 cursor-pointer">
                          عرض الكل <ArrowRight className="me-0.5 inline h-3 w-3" />
                        </button>
                      </div>
                      {recentTasks.length === 0 && projects.length === 0 ? (
                        <p className="py-6 text-center text-xs text-zinc-400">لا يوجد نشاط بعد</p>
                      ) : (
                        <div className="space-y-0">
                          {recentTasks.map((task, i) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05, duration: 0.25 }}
                              className="relative flex items-start gap-3 pb-4"
                            >
                              <div className="flex flex-col items-center">
                                <div className={cn('h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900', task.completed ? 'bg-emerald-500' : priorityColor[task.priority]?.dot || 'bg-zinc-300')} />
                                {i < recentTasks.length - 1 && <div className="mt-1 h-full w-px bg-zinc-100 dark:bg-zinc-800" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className={cn('text-sm leading-snug', task.completed ? 'text-zinc-400 line-through' : 'text-zinc-800 dark:text-zinc-200')}>{task.title}</p>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="text-[10px] text-zinc-400">{getDateLabel(task.dueDate || today)}</span>
                                  {task.completed && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">تم</span>}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {projects.map((p) => {
                            const count = tasks.filter((t) => t.projectId === p.id).length;
                            const done = tasks.filter((t) => t.projectId === p.id && t.completed).length;
                            const pct = count > 0 ? Math.round((done / count) * 100) : 0;
                            return (
                              <motion.button
                                key={p.id}
                                onClick={() => goToTasksWithProject(p.id)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="relative flex items-center gap-3 pb-3 w-full text-start"
                              >
                                <div className="flex flex-col items-center">
                                  <div className="h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-zinc-900" style={{ backgroundColor: p.color }} />
                                  <div className="mt-1 h-full w-px bg-zinc-100 dark:bg-zinc-800" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{p.name}</p>
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                                    </div>
                                    <span className="text-[10px] text-zinc-400 shrink-0">{done}/{count}</span>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-5">
                  {/* Greeting */}
                  <motion.div variants={itemVariants}>
                    <div className="flex flex-col gap-0.5">
                      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {greeting.text} <span className="inline-block">{greeting.icon}</span>
                      </h1>
                      <p className="text-sm text-zinc-400">{getArabicDate()}</p>
                      <p className="mt-1.5 max-w-xl rounded-xl bg-emerald-50/50 px-3 py-2 text-xs italic text-zinc-500 dark:bg-emerald-900/10 dark:text-zinc-400">
                        <Sparkles className="me-1 inline h-3 w-3 text-emerald-400" />
                        {dailyQuote}
                      </p>
                    </div>
                  </motion.div>

                  {/* 4 Stat Cards */}
                  <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: 'مهام اليوم', value: todayCount, icon: ListTodo,
                        gradient: 'from-emerald-500 to-emerald-400', shadow: 'shadow-emerald-500/20',
                        bgGlow: 'from-emerald-500/10 to-transparent',
                      },
                      {
                        label: 'مكتملة اليوم', value: todayCompleted, icon: CheckCircle2,
                        gradient: 'from-green-500 to-green-400', shadow: 'shadow-green-500/20',
                        bgGlow: 'from-green-500/10 to-transparent',
                      },
                      {
                        label: 'جلسات التركيز', value: totalPomodoros, icon: Timer,
                        gradient: 'from-amber-500 to-amber-400', shadow: 'shadow-amber-500/20',
                        bgGlow: 'from-amber-500/10 to-transparent',
                      },
                      {
                        label: 'أيام العادات', value: habitStreak, icon: Flame,
                        gradient: 'from-rose-500 to-rose-400', shadow: 'shadow-rose-500/20',
                        bgGlow: 'from-rose-500/10 to-transparent',
                      },
                    ].map((card) => (
                      <motion.div
                        key={card.label}
                        whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                        className="card-hover card-shadow group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-4 dark:border-zinc-800/40 dark:bg-zinc-900/60"
                      >
                        <div className={cn('absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100', card.bgGlow)} />
                        <div className="relative">
                          <div className="mb-3 flex items-center justify-between">
                            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm', card.gradient, card.shadow)}>
                              <card.icon className="h-5 w-5 text-white" />
                            </div>
                            <motion.span
                              key={card.value}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100"
                            >
                              {card.value}
                            </motion.span>
                          </div>
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.label}</span>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Progress Ring + Quick Actions side by side */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Productivity Ring */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="card-hover card-shadow relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.02] to-transparent" />
                      <div className="relative flex flex-col items-center">
                        <div className="relative mb-3">
                          <ProgressRing percent={completionRate} size={90} strokeWidth={6} color="#10b981" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span key={completionRate} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                              {completionRate}%
                            </motion.span>
                          </div>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">إنجاز المهام</h3>
                        <p className="mt-0.5 text-xs text-zinc-400">{completed} من {total} مهام</p>
                        <div className="mt-3 w-full">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-zinc-500">هدف اليوم</span>
                            <span className={cn('font-medium', completionRate >= 80 ? 'text-emerald-600' : completionRate >= 40 ? 'text-amber-600' : 'text-zinc-500')}>
                              {todayCount > 0 ? `${todayCompleted}/${todayCount}` : '—'}
                            </span>
                          </div>
                          <AnimatedProgressBar value={todayCompleted} max={todayCount || 1} />
                        </div>
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3 text-xs text-zinc-400">
                          {completionRate >= 80 ? '🎉 أداء رائع، استمر!' : pending <= 2 ? `💪 بقيت ${pending} ${pending === 1 ? 'مهمة' : 'مهام'} فقط` : '🌟 استمر في الإنجاز'}
                        </motion.p>
                      </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { icon: Plus, label: 'إضافة مهمة', onClick: goToTasks, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                          { icon: FolderKanban, label: 'مشروع جديد', onClick: () => router.push('/'), color: 'from-violet-500 to-violet-600', shadow: 'shadow-violet-500/20' },
                          { icon: Timer, label: 'جلسة تركيز', onClick: () => toggleFocusMode(), color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
                          { icon: Calendar, label: 'التقويم', onClick: () => router.push('/calendar'), color: 'from-sky-500 to-sky-600', shadow: 'shadow-sky-500/20' },
                          { icon: BarChart3, label: 'الإحصائيات', onClick: () => document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' }), color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
                          { icon: Flame, label: 'العادات', onClick: () => router.push('/habits'), color: 'from-rose-500 to-rose-600', shadow: 'shadow-rose-500/20' },
                        ].map((action) => (
                          <motion.button
                            key={action.label}
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={action.onClick}
                            className="card-hover card-shadow group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-white/80 p-3 text-start backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5" />
                            <div className="relative">
                              <div className={cn('mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform duration-200 group-hover:scale-110', action.color, action.shadow)}>
                                <action.icon className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{action.label}</span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Today's Tasks */}
                  <TodayTasksCard tasks={todayTasks} onToggle={handleToggleTodayTask} onNavigate={goToTasks} />

                  {/* Overdue Alert */}
                  {overdue > 0 && (
                    <motion.div variants={itemVariants}>
                      <div className="card-shadow rounded-2xl border border-rose-200/60 bg-gradient-to-r from-rose-50 to-rose-50/50 p-4 dark:border-rose-900/30 dark:from-rose-950/20 dark:to-rose-950/10">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                            <Clock className="h-4 w-4 text-rose-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                              {overdue} {overdue === 1 ? 'مهمة متأخرة' : 'مهام متأخرة'}
                            </p>
                            <p className="text-xs text-rose-500">تحتاج إلى مراجعة فورية</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Weekly Chart + Stats */}
                  <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* Weekly Chart */}
                    <div className="card-hover card-shadow rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                          <BarChart3 className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">النشاط الأسبوعي</h3>
                      </div>
                      <WeekChart days={weekDays} />
                      <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-200" />
                          <span>المهام المجدولة</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                          <span>المكتملة</span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics Summary */}
                    <div id="stats-section" className="card-hover card-shadow rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
                      <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/30">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">ملخص الإنتاجية</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { icon: CheckCircle2, value: `${completionRate}%`, label: 'معدل الإنجاز', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                          { icon: ListTodo, value: completed, label: 'مهام مكتملة', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                          { icon: Timer, value: totalPomodoros, label: 'جلسات تركيز', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                          { icon: Flame, value: `${habitStreak} يوم`, label: 'أفضل ستريك', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
                        ].map((stat) => (
                          <div key={stat.label} className="flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                            <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', stat.bg)}>
                              <stat.icon className={cn('h-4 w-4', stat.color)} />
                            </div>
                            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400">{stat.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
