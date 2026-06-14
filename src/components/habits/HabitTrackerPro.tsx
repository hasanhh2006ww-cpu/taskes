'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import type { DailyHabit, WeeklyHabit, MonthlyHabit } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { Plus, Trash2, GripVertical, Calendar, Target, Clock, ChevronDown } from 'lucide-react';
import { WEEKLY_FREQUENCIES, MONTH_PERIODS, getWeekKey, getWeekNumber, getMonthWeekKey, getDayLabel, formatDate, isToday } from '@/lib/constants';

interface HabitConfigProps {
  habit: DailyHabit | WeeklyHabit | MonthlyHabit;
  onUpdate: (updates: Partial<DailyHabit> | Partial<WeeklyHabit> | Partial<MonthlyHabit>) => void;
  onDelete: () => void;
  onToggleCompletion: (date: string, allowPastEdit: boolean) => void;
  onToggleWeeklyCompletion: (date: string, allowPastEdit: boolean) => void;
  onToggleMonthlyCompletion: (date: string, allowPastEdit: boolean) => void;
}

function HabitConfigPanel({ habit, onUpdate, onDelete, onToggleCompletion, onToggleWeeklyCompletion, onToggleMonthlyCompletion }: HabitConfigProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (habit.type === 'daily') {
    return (
      <div className="space-y-3 p-4 rounded-xl border border-zinc-200/60 bg-white/50 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Daily Habit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <span>{showAdvanced ? 'إخفاء' : 'متقدم'}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-180')} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
               Streak: <span className="text-amber-500 dark:text-amber-400">{habit.streak}</span>
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Best: <span className="text-blue-500 dark:text-blue-400">{habit.bestStreak}</span>
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Last: {habit.lastCompletedDate ? formatDate(habit.lastCompletedDate) : 'Never'}
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Today: {isToday(getToday()) ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (habit.type === 'weekly') {
    const weeklyHabit = habit as WeeklyHabit;
    return (
      <div className="space-y-3 p-4 rounded-xl border border-zinc-200/60 bg-white/50 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Weekly Habit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <span>{showAdvanced ? 'إخفاء' : 'متقدم'}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-180')} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Frequency: {WEEKLY_FREQUENCIES.find(f => f.value === weeklyHabit.frequency)?.label}
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Days: {weeklyHabit.daysOfWeek.map(d => getDayLabel(d)).join(', ')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  Current streak: <span className="text-amber-500 dark:text-amber-400">{weeklyHabit.streak}</span>
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  Best streak: <span className="text-blue-500 dark:text-blue-400">{weeklyHabit.bestStreak}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (habit.type === 'monthly') {
    const monthlyHabit = habit as MonthlyHabit;
    return (
      <div className="space-y-3 p-4 rounded-xl border border-zinc-200/60 bg-white/50 dark:border-zinc-800/40 dark:bg-zinc-900/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Monthly Habit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              <span>{showAdvanced ? 'إخفاء' : 'متقدم'}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', showAdvanced && 'rotate-180')} />
            </button>
          </div>
        </div>

        {showAdvanced && (
          <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Period: {MONTH_PERIODS.find(p => p.value === monthlyHabit.period)?.label}
              </div>
              <div className="text-xs text-zinc-400 dark:text-zinc-500">
                Target: {monthlyHabit.targetCount} sessions per month
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  Current streak: <span className="text-amber-500 dark:text-amber-400">{monthlyHabit.streak}</span>
                </div>
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  Best streak: <span className="text-blue-500 dark:text-blue-400">{monthlyHabit.bestStreak}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export function HabitTrackerPro() {
  const {
    habits,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    toggleDailyCompletion,
    toggleWeeklyCompletion,
    toggleMonthlyCompletion,
    userTimezone,
    activeFilter,
    setActiveFilter,
  } = useHabitStore();

  const [newTitle, setNewTitle] = useState('');
  const [newHabitType, setNewHabitType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [weeklyFrequency, setWeeklyFrequency] = useState<WeeklyFrequency>(3);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3, 5]);
  const [monthlyPeriod, setMonthlyPeriod] = useState<'start' | 'middle' | 'end'>('middle');
  const [monthlyTarget, setMonthlyTarget] = useState<number>(4);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const today = new Date();
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: i === 0,
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const filteredHabits = habits.filter((h) => h.type === activeFilter);

  function handleAdd() {
    if (!newTitle.trim()) return;

    let options;
    if (newHabitType === 'weekly') {
      options = { frequency: weeklyFrequency, daysOfWeek: weeklyDays };
    } else if (newHabitType === 'monthly') {
      options = { period: monthlyPeriod, targetCount: monthlyTarget };
    }

    addHabit(newTitle.trim(), newHabitType, options);
    setNewTitle('');
    setWeeklyDays([1, 3, 5]);
  }

  function handleEditStart(habit: { id: string; title: string }) {
    setEditingId(habit.id);
    setEditTitle(habit.title);
  }

  function handleEditSave(id: string) {
    if (!editTitle.trim()) return;
    updateHabit(id, { title: editTitle.trim() });
    setEditingId(null);
    setEditTitle('');
  }

  function handleDragEnd(event: { active: { id: string }; over: { id: string } | null }) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = habits.findIndex((h) => h.id === active.id);
    const newIndex = habits.findIndex((h) => h.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderHabits(oldIndex, newIndex);
    }
  }

  function isCompletedForDate(habit: DailyHabit | WeeklyHabit | MonthlyHabit, date: string): boolean {
    switch (habit.type) {
      case 'daily':
        return (habit as DailyHabit).completions[date] === true;
      case 'weekly':
        return (habit as WeeklyHabit).completedWeeks[getWeekKey(date)] === true;
      case 'monthly':
        return ((habit as MonthlyHabit).completedDays[getMonthWeekKey(date)] || 0) >= 1;
      default:
        return false;
    }
  }

  function toggleCompletionForDate(habitId: string, date: string) {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const today = new Date();
    const isCurrentDay = date === today.toISOString().split('T')[0];

    if (habit.type === 'daily') {
      toggleDailyCompletion(habitId, date, true);
    } else if (habit.type === 'weekly') {
      toggleWeeklyCompletion(habitId, date, true);
    } else if (habit.type === 'monthly') {
      toggleMonthlyCompletion(habitId, date, true);
    }
  }

  function getStreakMessage(habit: DailyHabit | WeeklyHabit | MonthlyHabit): string | null {
    const completedDays = Object.keys(habit.completions || {}).filter((date) => {
      const habitType = habit.type;
      if (habitType === 'daily') {
        return (habit as DailyHabit).completions[date] === true;
      } else if (habitType === 'weekly') {
        return (habit as WeeklyHabit).completedWeeks[getWeekKey(date)] === true;
      } else if (habitType === 'monthly') {
        return (habit as MonthlyHabit).completedDays[getMonthWeekKey(date)] >= 1;
      }
      return false;
    }).sort().reverse();

    if (completedDays.length === 0) return 'ابدأ بالتسجيل اليوم!';

    const currentDay = completedDays[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (habit.type === 'daily') {
      const dailyHabit = habit as DailyHabit;
      if (dailyHabit.lastCompletedDate === yesterday && currentDay !== yesterday) {
        return 'لقد فاتك أمس!';
      }
    } else if (habit.type === 'weekly') {
      const weeklyHabit = habit as WeeklyHabit;
      if (weeklyHabit.lastCompletedDate === yesterday && !isCompletedForDate(habit, getToday())) {
        return 'لقد فاتك الأسبوع الماضي!';
      }
    } else if (habit.type === 'monthly') {
      const monthlyHabit = habit as MonthlyHabit;
      if (monthlyHabit.lastCompletedDate === yesterday && !isCompletedForDate(habit, getToday())) {
        return 'لقد فاتك الأسبوع الماضي!';
      }
    }

    return null;
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">متتبع العادات الاحترافي</h1>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          {habits.length} عادات إجمالاً
        </div>
      </div>

      <div className="px-4 pb-4 md:px-6">
        <div className="mb-4 rounded-xl border border-zinc-200/60 bg-white/50 p-1 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveFilter('daily')}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeFilter === 'daily'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              يومي
            </button>
            <button
              onClick={() => setActiveFilter('weekly')}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeFilter === 'weekly'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              أسبوعي
            </button>
            <button
              onClick={() => setActiveFilter('monthly')}
              className={cn(
                'rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeFilter === 'monthly'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              )}
            >
              شهري
            </button>
          </div>
        </div>
      </div>

      {habits.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">لا توجد عادات بعد</p>
          <p className="text-xs text-zinc-300 dark:text-zinc-600">
            أضف عادة وقم بتحديد نوعها وتكرارها
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
        {habits.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">إنشاء عادة جديدة</h2>
            <div className="space-y-3 rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500">النوع</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setNewHabitType('daily')}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                      newHabitType === 'daily'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-400'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    يومي
                  </button>
                  <button
                    onClick={() => setNewHabitType('weekly')}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                      newHabitType === 'weekly'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-400'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    أسبوعي
                  </button>
                  <button
                    onClick={() => setNewHabitType('monthly')}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                      newHabitType === 'monthly'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-400'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    شهري
                  </button>
                </div>
              </div>

              {newHabitType === 'daily' && (
                <div className="text-xs text-zinc-400 dark:text-zinc-500">
                  يتم تتبع كل يوم بشكل فردي.
                </div>
              )}

              {newHabitType === 'weekly' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500">التكرار</label>
                    <select
                      value={weeklyFrequency}
                      onChange={(e) => setWeeklyFrequency(parseInt(e.target.value) as WeeklyFrequency)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {WEEKLY_FREQUENCIES.map((f) => (
                        <option key={f.value} value={f.value}>{f.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500">الأيام</label>
                    <div className="grid grid-cols-7 gap-1">
                      {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, index) => {
                        const isSelected = weeklyDays.includes(index);
                        return (
                          <button
                            key={day}
                            onClick={() => {
                              const newDays = isSelected
                                ? weeklyDays.filter(d => d !== index)
                                : [...weeklyDays, index];
                              setWeeklyDays(newDays);
                            }}
                            className={cn(
                              'rounded px-1 py-1 text-[10px] font-medium transition-all',
                              isSelected
                                ? 'bg-indigo-500 text-white'
                                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
                            )}
                          >
                            {day[0]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {newHabitType === 'monthly' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500">الفترة</label>
                    <select
                      value={monthlyPeriod}
                      onChange={(e) => setMonthlyPeriod(e.target.value as 'start' | 'middle' | 'end')}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {MONTH_PERIODS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400 dark:text-zinc-500">الهدف (عدد الأسابيع في الشهر)</label>
                    <select
                      value={monthlyTarget}
                      onChange={(e) => setMonthlyTarget(parseInt(e.target.value))}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {[1, 2, 3, 4].map(n => (
                        <option key={n} value={n}>{n} أسابيع</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex-1 items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-3 py-2.5 backdrop-blur-sm transition-colors dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:focus-within:border-zinc-700/60">
                  <Input
                    placeholder="اسم العادة..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleAdd}
                  className="px-6"
                >
                  إضافة
                </Button>
              </div>
            </div>
          </div>
        )}

        {filteredHabits.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {activeFilter === 'daily' ? 'العادات اليومية' : activeFilter === 'weekly' ? 'العادات الأسبوعية' : 'العادات الشهرية'}
            </h2>
            {filteredHabits.map((habit) => {
              const isStreakBroken = getStreakMessage(habit) !== null;
              return (
                <div key={habit.id} className="mb-3">
                  <div className={cn(
                    'rounded-xl border p-4 backdrop-blur-sm transition-all',
                    isStreakBroken
                      ? 'border-rose-200 bg-rose-50/50 dark:border-rose-800/50 dark:bg-rose-950/20'
                      : 'border-zinc-200/60 bg-white/50 dark:border-zinc-800/40 dark:bg-zinc-900/40'
                  )}>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-5 w-5 text-zinc-300 cursor-grab active:cursor-grabbing" />
                        {editingId === habit.id ? (
                          <Input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleEditSave(habit.id)}
                            onBlur={() => handleEditSave(habit.id)}
                            autoFocus
                            className="text-sm"
                          />
                        ) : (
                          <div
                            className="text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                            onDoubleClick={() => handleEditStart(habit)}
                          >
                            {habit.title}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {habit.type === 'daily' && (
                          <div className="text-xs text-zinc-400 dark:text-zinc-500">
                            اليوم: {isToday(getToday()) ? '✅' : '❌'}
                          </div>
                        )}

                        {habit.streak > 0 && (
                          <div className={cn(
                            'flex items-center gap-1 text-xs font-medium',
                            isStreakBroken
                              ? 'text-rose-500 dark:text-rose-400'
                              : 'text-amber-500 dark:text-amber-400'
                          )}>
                            <span>🔥</span>
                            <span>{habit.streak}</span>
                          </div>
                        )}

                        {habit.bestStreak > habit.streak && (
                          <div className="flex items-center gap-1 text-xs font-medium text-blue-500 dark:text-blue-400">
                            <span>🏆</span>
                            <span>{habit.bestStreak}</span>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditStart(habit)}
                          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                          aria-label="تعديل"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>

                        <Button
                          variant="danger"
                          size="icon"
                          onClick={() => deleteHabit(habit.id)}
                          className="text-zinc-400 hover:text-rose-500"
                          aria-label="حذف"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <HabitConfigPanel
                      habit={habit}
                      onUpdate={(updates) => updateHabit(habit.id, updates)}
                      onDelete={() => deleteHabit(habit.id)}
                      onToggleCompletion={(date, allowPastEdit) => toggleDailyCompletion(habit.id, date, allowPastEdit)}
                      onToggleWeeklyCompletion={(date, allowPastEdit) => toggleWeeklyCompletion(habit.id, date, allowPastEdit)}
                      onToggleMonthlyCompletion={(date, allowPastEdit) => toggleMonthlyCompletion(habit.id, date, allowPastEdit)}
                    />

                    {getStreakMessage(habit) && (
                      <div className={cn(
                        'mt-3 rounded-lg border px-3 py-2 text-xs font-medium',
                        isStreakBroken
                          ? 'border-rose-300 bg-rose-100/50 text-rose-600 dark:border-rose-800/30 dark:bg-rose-950/30 dark:text-rose-400'
                          : 'border-green-300 bg-green-100/50 text-green-600 dark:border-green-800/30 dark:bg-green-950/30 dark:text-green-400'
                      )}
                      >
                        {getStreakMessage(habit)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}