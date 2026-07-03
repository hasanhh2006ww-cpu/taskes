'use client';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useUIStore } from '@/store/useUIStore';
import { getToday, getWeekKey } from '@/lib/constants';
import { cn } from '@/lib/cn';
import {
  ListTodo, Calendar, CheckCircle2, Clock,
  Plus, BarChart3,
  ArrowRight, Sprout, Target,
  Timer, Flame,
  FolderKanban, Sparkles,
  Activity, ClipboardList,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
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

const ANNOUNCEMENTS = [
  { icon: Sparkles, title: 'نصيحة اليوم', message: 'قسّم مهامك الكبيرة إلى مهام صغيرة قابلة للتحقيق لتشعر بالتقدم يومياً', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Target, title: 'تحدي الأسبوع', message: 'حقق 3 جلسات تركيز هذا الأسبوع لتعزيز إنتاجيتك', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { icon: Activity, title: 'الإنتاجية الجماعية', message: 'العادات اليومية الصغيرة تصنع فرقاً كبيراً على المدى الطويل', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
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
  const d = new Date();
  return `${DAY_NAMES_LONG[d.getDay()]}، ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 1) return '0 د';
  if (minutes < 60) return `${minutes} د`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}س ${m}د` : `${h}س`;
}

function WeekChart({ days }: { days: { label: string; total: number; done: number }[] }) {
  const safeDays = days.map(d => ({
    label: d.label,
    total: Number.isFinite(d.total) ? Math.max(0, d.total) : 0,
    done: Number.isFinite(d.done) ? Math.max(0, d.done) : 0,
  }));
  const maxVal = Math.max(...safeDays.map(d => d.total), 1);
  return (
    <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
      {safeDays.map((day, i) => {
        const totalH = day.total > 0 ? Math.max((day.total / maxVal) * 100, 8) : 0;
        const doneH = day.done > 0 && day.total > 0 ? Math.max((day.done / day.total) * totalH, 4) : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: `${Math.max(totalH, doneH) || 0}%` }}>
              {day.total > 0 && (
                <div className="absolute bottom-0 w-full flex flex-col-reverse items-center">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-200 to-emerald-100 transition-all duration-500"
                    style={{ height: `${totalH}%`, minHeight: '4px' }}
                  />
                  <div
                    className="absolute bottom-0 w-1/2 rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{ height: `${doneH}%`, minHeight: day.done > 0 ? '4px' : '0' }}
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
  const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(percent, 100)) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - safePercent / 100);
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
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const safeMax = Number.isFinite(max) ? Math.max(0, max) : 1;
  const pct = safeMax > 0 ? Math.min((safeValue / safeMax) * 100, 100) : 0;
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

function TodayTasksCard({ isEmpty, tasks, onToggle, onNavigate, goToTasks }: { isEmpty: boolean; tasks: { id: string; title: string; priority: string; completed: boolean }[]; onToggle: (id: string) => void; onNavigate: () => void; goToTasks: () => void }) {
  if (isEmpty) {
    return (
      <motion.div variants={itemVariants} className="card-base p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">مهام اليوم</h3>
          </div>
        </div>
        <EmptyState
          icon={ClipboardList}
          title="لا توجد مهام لهذا اليوم"
          description="أضف مهامك الآن لتبدأ يومك بشكل منظم"
          actionLabel="إضافة مهمة"
          onAction={goToTasks}
          variant="compact"
        />
      </motion.div>
    );
  }
  return (
    <motion.div variants={itemVariants} className="card-base p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-emerald-500" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">مهام اليوم</h3>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">{tasks.length}</span>
        </div>
        <button onClick={onNavigate} className="text-[10px] font-medium text-emerald-600 transition-colors hover:text-emerald-700 cursor-pointer">
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

function MiniCalendar() {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const todayNum = today.getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  return (
    <div className="card-base p-5">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-emerald-500" />
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{MONTH_NAMES[currentMonth]} {currentYear}</h3>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_NAMES_SHORT.map((d) => (
          <div key={d} className="text-[10px] font-medium text-zinc-400 py-1">{d}</div>
        ))}
        {days.map((d, i) => (
          <div
            key={i}
            className={cn(
              'rounded-lg py-1.5 text-xs transition-colors',
              d === null ? 'invisible' : 'text-zinc-600 dark:text-zinc-400',
              d === todayNum ? 'bg-emerald-500 font-bold text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            {d}
          </div>
        ))}
      </div>
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

export function Dashboard() {
  const router = useRouter();
  const tasks = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const { setActiveProjectId, toggleComplete } = useTaskStore();

  const habits = useHabitStore((s) => s.habits);
  const { toggleFocusMode } = useUIStore();

  const today = getToday();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const todayCount = tasks.filter((t) => t.dueDate === today).length;
  const todayCompleted = tasks.filter((t) => t.dueDate === today && t.completed).length;
  const overdue = tasks.filter((t) => t.dueDate && t.dueDate < today && !t.completed).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const totalPomodoros = tasks.reduce((sum, t) => sum + (t.pomodoroCount ?? 0), 0);

  const todayTasks = useMemo(() =>
    tasks.filter((t) => t.dueDate === today && !t.completed).slice(0, 8),
    [tasks, today]
  );

  const todayHabitCompletions = useMemo(() => {
    return habits.filter((h) => {
      if (h.type === 'daily') return h.completions?.[today] === true;
      if (h.type === 'weekly') {
        return h.completedWeeks?.[getWeekKey(today)] === true;
      }
      return false;
    }).length;
  }, [habits, today]);

  const habitStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map((h) => h.streak || 0));
  }, [habits]);

  const focusMinutes = useMemo(() => totalPomodoros * 25, [totalPomodoros]);

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

  const todayPomodoros = useMemo(() => {
    return tasks.filter(t => t.dueDate === today).reduce((sum, t) => sum + (t.pomodoroCount ?? 0), 0);
  }, [tasks, today]);

  const goToTasks = useCallback(() => {
    router.push('/tasks');
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('[data-task-input]')?.focus();
    }, 100);
  }, [router]);

  const goToTasksWithProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
    router.push('/tasks');
  }, [router, setActiveProjectId]);

  const handleToggleTodayTask = useCallback((taskId: string) => {
    toggleComplete(taskId);
    toast.success('تم تحديث المهمة');
  }, [toggleComplete]);

  const [greeting, setGreeting] = useState({ text: '', icon: '' });
  const [arabicDate, setArabicDate] = useState('');
  const [dailyQuote, setDailyQuote] = useState('');
  useEffect(() => {
    useTaskStore.getState().rehydrate();
    useProjectStore.getState().rehydrate();
    useHabitStore.getState().rehydrate();
    useUIStore.getState().rehydrate();
    setGreeting(getGreeting());
    setArabicDate(getArabicDate());
    setDailyQuote(QUOTES[new Date().getDate() % QUOTES.length]);
  }, []);

  const isEmpty = total === 0;

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-transparent">
      <div className="flex-1 overflow-y-auto">
        <div className="w-full p-4 md:p-6 max-w-7xl mx-auto">
          {isEmpty && (
            <motion.div variants={itemVariants} className="mb-5 flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-zinc-200/60 bg-white dark:border-zinc-800/40 dark:bg-zinc-900/60">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 shadow-sm dark:from-emerald-900/20 dark:to-emerald-800/20"
              >
                <Sprout className="h-12 w-12 text-emerald-400" />
              </motion.div>
              <h2 className="mb-2 text-xl font-extrabold text-zinc-900 dark:text-zinc-100">ابدأ رحلة الإنجاز</h2>
              <p className="mb-6 text-sm text-zinc-400">أنشئ أول مهمة لك وابدأ في تنظيم يومك</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goToTasks}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40"
              >
                إنشاء أول مهمة
              </motion.button>
              <motion.div className="mt-6 grid grid-cols-2 gap-3 md:flex md:gap-4">
                {[
                  { icon: CheckCircle2, label: 'إدارة المهام', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                  { icon: FolderKanban, label: 'المشاريع', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/30' },
                  { icon: Timer, label: 'جلسات التركيز', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/30' },
                  { icon: Flame, label: 'العادات', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/30' },
                ].map((feature) => (
                  <div key={feature.label} className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-white px-3 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                    <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', feature.bg)}>
                      <feature.icon className={cn('h-4 w-4', feature.color)} />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{feature.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full space-y-5">

            {/* 1. Welcome Section */}
            <motion.div variants={itemVariants} className="card-base p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {greeting.text} {greeting.icon}
                  </h1>
                  <p className="text-sm text-zinc-400 mt-0.5">{arabicDate}</p>
                </div>
                <p className="rounded-xl bg-emerald-50/50 px-4 py-2 text-xs italic text-zinc-500 dark:bg-emerald-900/10 dark:text-zinc-400 max-w-md">
                  <Sparkles className="ms-1 inline h-3 w-3 text-emerald-400" />
                  {dailyQuote}
                </p>
              </div>
            </motion.div>

            {/* 2. Quick Actions */}
            <motion.div variants={itemVariants}>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[
                  { icon: Plus, label: 'إضافة مهمة', onClick: goToTasks, color: 'from-emerald-500 to-emerald-600' },
                  { icon: FolderKanban, label: 'مشروع جديد', onClick: () => router.push('/tasks'), color: 'from-violet-500 to-violet-600' },
                  { icon: Timer, label: 'جلسة تركيز', onClick: () => toggleFocusMode(), color: 'from-amber-500 to-amber-600' },
                  { icon: Calendar, label: 'التقويم', onClick: () => router.push('/calendar'), color: 'from-sky-500 to-sky-600' },
                  { icon: BarChart3, label: 'الإحصائيات', onClick: () => router.push('/tasks'), color: 'from-indigo-500 to-indigo-600' },
                  { icon: Flame, label: 'العادات', onClick: () => router.push('/habits'), color: 'from-rose-500 to-rose-600' },
                ].map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={action.onClick}
                    className="card-base group flex flex-col items-center gap-2 p-3 sm:p-4 text-center hover:border-emerald-200 dark:hover:border-emerald-800"
                  >
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform group-hover:scale-110', action.color)}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* 3. Statistics — 4 Stat Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'مهام اليوم', value: todayCount, icon: ListTodo, gradient: 'from-emerald-500 to-emerald-400' },
                { label: 'مكتملة اليوم', value: todayCompleted, icon: CheckCircle2, gradient: 'from-green-500 to-green-400' },
                { label: 'جلسات التركيز', value: totalPomodoros, icon: Timer, gradient: 'from-amber-500 to-amber-400' },
                { label: 'أيام العادات', value: habitStreak, icon: Flame, gradient: 'from-rose-500 to-rose-400' },
              ].map((card) => (
                <motion.div
                  key={card.label}
                  whileHover={{ scale: 1.02, y: -2, transition: { duration: 0.2 } }}
                  className="card-base p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm', card.gradient)}>
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">{card.value}</span>
                  </div>
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{card.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* 4. Charts — Progress Ring + Weekly Chart */}
            <motion.div id="stats-section" variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Progress Ring */}
              <div className="card-base p-5">
                <div className="flex flex-col items-center">
                  <div className="relative mb-3">
                    <ProgressRing percent={completionRate} size={90} strokeWidth={6} color="#10b981" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100">{completionRate}%</span>
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
                  <p className="mt-3 text-xs text-zinc-400">
                    {completionRate >= 80 ? '🎉 أداء رائع، استمر!' : pending <= 2 ? `💪 بقيت ${pending} ${pending === 1 ? 'مهمة' : 'مهام'} فقط` : '🌟 استمر في الإنجاز'}
                  </p>
                </div>
              </div>

              {/* Weekly Chart */}
              <div className="card-base p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-500" />
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
            </motion.div>

            {/* 5. Today's Tasks */}
            <TodayTasksCard
              isEmpty={todayTasks.length === 0}
              tasks={todayTasks}
              onToggle={handleToggleTodayTask}
              onNavigate={goToTasks}
              goToTasks={goToTasks}
            />

            {/* Overdue Alert */}
            {overdue > 0 && (
              <motion.div variants={itemVariants}>
                <div className="card-base border-rose-200/60 bg-gradient-to-r from-rose-50 to-rose-50/50 p-4 dark:border-rose-900/30 dark:from-rose-950/20 dark:to-rose-950/10">
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

            {/* 6. Recent Activity */}
            <motion.div variants={itemVariants} className="card-base p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">النشاط الأخير</h3>
                </div>
                <button onClick={goToTasks} className="text-[10px] font-medium text-emerald-600 transition-colors hover:text-emerald-700 cursor-pointer">
                  عرض الكل <ArrowRight className="me-0.5 inline h-3 w-3" />
                </button>
              </div>
              {recentTasks.length === 0 && projects.length === 0 ? (
                <EmptyState
                  icon={Clock}
                  title="لا يوجد نشاط حتى الآن"
                  description="ستظهر هنا آخر المهام والمشاريع التي قمت بها"
                  variant="compact"
                />
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
            </motion.div>

            {/* 7. Announcements */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ANNOUNCEMENTS.map((item) => (
                <div key={item.title} className="card-base p-4 flex items-start gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', item.bg)}>
                    <item.icon className={cn('h-4 w-4', item.color)} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h4>
                    <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* 8. Mini Calendar */}
            <motion.div variants={itemVariants}>
              <MiniCalendar />
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}