'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import type { Habit, DailyHabit, WeeklyHabit, MonthlyHabit } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { Plus, Trash2, GripVertical, Download, Upload, Flame } from 'lucide-react';
import { getToday, getWeekKey, getMonthWeekKey } from '@/lib/constants';
import { AddEditHabitModal } from './AddEditHabitModal';
import { ConfirmDialog } from './ConfirmDialog';
import { getHabitIcon } from '@/lib/habitIcons';
import toast from 'react-hot-toast';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

function SortableHabitCard({ habit }: { habit: Habit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  const Icon = getHabitIcon(habit.icon);
  const habitColor = habit.color || '#f59e0b';
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm transition-all duration-200 dark:border-zinc-800/40 dark:bg-zinc-900/40 hover:shadow-md">
        <div className="flex items-center gap-3 min-w-0">
          <button {...listeners} className="cursor-grab touch-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" aria-label="سحب">
            <GripVertical className="h-5 w-5" />
          </button>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${habitColor}18` }}>
            <Icon className="h-5 w-5" style={{ color: habitColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{habit.title}</div>
            <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: habitColor }}>
              {habit.type === 'daily' ? 'يومي' : habit.type === 'weekly' ? 'أسبوعي' : 'شهري'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HabitTrackerPro() {
  const { habits, addHabit, updateHabit, deleteHabit, reorderHabits, toggleDailyCompletion, toggleWeeklyCompletion, toggleMonthlyCompletion, exportData, importData } = useHabitStore();

  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'stats'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editHabit, setEditHabit] = useState<Habit | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [celebratingId, setCelebratingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    useHabitStore.getState().rehydrate();
  }, []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const displayedHabits = useMemo(() => {
    if (isReordering) {
      return [...habits].sort((a, b) => a.order - b.order);
    }
    return habits
      .filter((h) => activeTab === 'all' || h.type === activeTab)
      .sort((a, b) => a.order - b.order);
  }, [habits, activeTab, isReordering]);

  function handleModalSave(title: string, type: 'daily' | 'weekly' | 'monthly', options?: Record<string, unknown>) {
    addHabit(title, type, options as Partial<WeeklyHabit> | Partial<MonthlyHabit>);
    setShowAddModal(false);
  }

  function handleEditSave(title: string, type: 'daily' | 'weekly' | 'monthly', options?: Record<string, unknown>) {
    if (!editHabit) return;
    const { id } = editHabit;
    if (editHabit.type === type) {
      if (type === 'daily') {
        updateHabit(id, { title, ...options });
      } else {
        updateHabit(id, { title, ...options });
      }
    } else {
      const base = {
        id,
        title,
        description: (options?.description as string) || (editHabit as any).description || '',
        type,
        icon: (options?.icon as string) || (editHabit as any).icon || 'Flame',
        color: (options?.color as string) || (editHabit as any).color || '#f59e0b',
        createdAt: editHabit.createdAt,
        order: editHabit.order,
        streak: 0,
        bestStreak: editHabit.bestStreak,
        lastCompletedDate: null,
      } as Habit;
      if (type === 'daily') {
        updateHabit(id, { ...base, type: 'daily', completions: {} } as unknown as Partial<Habit>);
      } else if (type === 'weekly') {
        updateHabit(id, { ...base, type: 'weekly', ...options, completedWeeks: {} } as unknown as Partial<Habit>);
      } else {
        updateHabit(id, { ...base, type: 'monthly', ...options, completedDays: {} } as unknown as Partial<Habit>);
      }
    }
    setEditHabit(null);
    toast.success('تم تحديث العادة بنجاح');
  }

  function handleDeleteConfirm() {
    if (!deleteConfirmId) return;
    deleteHabit(deleteConfirmId);
    setDeleteConfirmId(null);
    toast.success('تم حذف العادة');
  }

  function getProgressPercent(habit: Habit): number {
    const today = getToday();
    if (habit.type === 'daily') return habit.completions[today] === true ? 100 : 0;
    if (habit.type === 'weekly') return habit.completedWeeks[getWeekKey(today)] === true ? 100 : 0;
    if (habit.type === 'monthly') {
      const monthKey = getMonthWeekKey(today);
      const m = habit as MonthlyHabit;
      const done = m.completedDays[monthKey] || 0;
      return Math.min(100, Math.round((done / m.targetCount) * 100));
    }
    return 0;
  }

  function toggleCompletion(habit: DailyHabit | WeeklyHabit | MonthlyHabit) {
    const wasCompleted = isCompletedToday(habit);
    if (habit.type === 'daily') toggleDailyCompletion(habit.id);
    else if (habit.type === 'weekly') toggleWeeklyCompletion(habit.id);
    else toggleMonthlyCompletion(habit.id);
    if (!wasCompleted) {
      setCelebratingId(habit.id);
      setTimeout(() => setCelebratingId(null), 700);
    }
  }

  function isCompletedToday(habit: DailyHabit | WeeklyHabit | MonthlyHabit): boolean {
    const today = getToday();
    if (habit.type === 'daily') return habit.completions[today] === true;
    if (habit.type === 'weekly') return habit.completedWeeks[getWeekKey(today)] === true;
    if (habit.type === 'monthly') return (habit.completedDays[getMonthWeekKey(today)] || 0) >= 1;
    return false;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const allSorted = [...habits].sort((a, b) => a.order - b.order);
    const oldIndex = allSorted.findIndex((h) => h.id === active.id);
    const newIndex = allSorted.findIndex((h) => h.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderHabits(oldIndex, newIndex);
    }
  }

  function handleExport() {
    try {
      const json = exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-taske-habits-${getToday()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('تم تصدير البيانات بنجاح');
    } catch {
      toast.error('فشل تصدير البيانات');
    }
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        importData(json);
        toast.success('تم استيراد البيانات بنجاح');
      } catch {
        toast.error('فشل استيراد البيانات - الملف غير صالح');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const deleteTarget = deleteConfirmId ? habits.find(h => h.id === deleteConfirmId) : null;

  function computeStats() {
    const today = getToday();
    const weekKey = getWeekKey(today);
    const monthKey = getMonthWeekKey(today);
    let dailyTotal = 0, dailyDone = 0;
    let weeklyTotal = 0, weeklyDone = 0;
    let monthlyTotal = 0, monthlyDone = 0;
    let bestStreak = 0;

    habits.forEach((h) => {
      if (h.streak > bestStreak) bestStreak = h.streak;
      if (h.bestStreak > bestStreak) bestStreak = h.bestStreak;
      if (h.type === 'daily') {
        dailyTotal++;
        if (h.completions[today] === true) dailyDone++;
      } else if (h.type === 'weekly') {
        weeklyTotal++;
        if (h.completedWeeks[weekKey] === true) weeklyDone++;
      } else {
        monthlyTotal++;
        if ((h.completedDays[monthKey] || 0) >= 1) monthlyDone++;
      }
    });

    const totalHabits = habits.length;
    const completedToday = dailyDone + weeklyDone + monthlyDone;
    const todayPercent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return { dailyTotal, dailyDone, weeklyTotal, weeklyDone, monthlyTotal, monthlyDone, totalHabits, completedToday, todayPercent, bestStreak };
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">متتبع العادات</h1>
        <div className="flex items-center gap-2">
          {activeTab !== 'stats' && (
            <button
              onClick={() => {
                setIsReordering(!isReordering);
                if (!isReordering) setActiveTab('all');
              }}
              className={cn(
                'rounded-lg p-2 text-xs font-medium transition-all',
                isReordering
                  ? 'bg-indigo-500 text-white'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
              aria-label="ترتيب"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {habits.length} {habits.length === 1 ? 'عادة' : 'عادات'}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 md:px-6">
        <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-1 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
          <div className="grid grid-cols-5 gap-1">
            {(['all', 'daily', 'weekly', 'monthly', 'stats'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setIsReordering(false); }}
                className={cn(
                  'rounded-lg px-2 py-2.5 text-xs font-medium transition-all md:px-4 md:text-sm',
                  activeTab === tab
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                )}
              >
                {tab === 'all' ? 'الكل' : tab === 'daily' ? 'يومي' : tab === 'weekly' ? 'أسبوعي' : tab === 'monthly' ? 'شهري' : 'إحصائيات'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="flex-1 overflow-y-auto px-4 pb-24 md:px-6">
          {(() => {
            const stats = computeStats();
            return (
              <div className="space-y-4">
                <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">ملخص اليوم</h3>
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>إنجاز اليوم</span>
                    <span>{stats.completedToday} / {stats.totalHabits}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${stats.todayPercent}%` }} />
                  </div>
                  <div className="mt-1 text-end text-[10px] text-zinc-400">{stats.todayPercent}%</div>
                </div>

                <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">تفاصيل العادات</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">العادات اليومية</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{stats.dailyDone}/{stats.dailyTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">العادات الأسبوعية</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{stats.weeklyDone}/{stats.weeklyTotal}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400">العادات الشهرية</span>
                      <span className="text-zinc-700 dark:text-zinc-300">{stats.monthlyDone}/{stats.monthlyTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">أفضل سلسلة إنجاز</h3>
                  <div className="flex items-center gap-2 text-lg font-bold text-amber-500">
                    <span>🏆</span>
                    <span>{stats.bestStreak} {stats.bestStreak === 1 ? 'يوم' : 'أيام'}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
                  <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">تصدير / استيراد</h3>
                  <div className="flex items-center gap-3">
                    <Button variant="primary" onClick={handleExport} className="flex-1">
                      <Download className="h-4 w-4" /> تصدير
                    </Button>
                    <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="flex-1">
                      <Upload className="h-4 w-4" /> استيراد
                    </Button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFile}
                    className="hidden"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {activeTab !== 'stats' && habits.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">لا توجد عادات بعد</p>
          <p className="text-xs text-zinc-300 dark:text-zinc-600">اضغط على زر + لإضافة عادة جديدة</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-24 md:px-6">
        {activeTab !== 'stats' && activeTab !== 'all' && displayedHabits.length === 0 && habits.length > 0 && (
          <div className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            لا توجد عادات {activeTab === 'daily' ? 'يومية' : activeTab === 'weekly' ? 'أسبوعية' : 'شهرية'} بعد
          </div>
        )}

        {isReordering ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayedHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
              {displayedHabits.map((habit) => (
                <SortableHabitCard key={habit.id} habit={habit} />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {displayedHabits.map((habit) => {
            const completed = isCompletedToday(habit);
            const hColor = (habit as any).color || '#f59e0b';
            const Icon = getHabitIcon((habit as any).icon);
            const progress = getProgressPercent(habit);
            return (
              <div key={habit.id}>
                <div
                  className={cn(
                    'rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm transition-all duration-200 dark:border-zinc-800/40 dark:bg-zinc-900/40 hover:shadow-lg hover:-translate-y-0.5',
                    celebratingId === habit.id && 'ring-2 ring-offset-2 dark:ring-offset-zinc-900'
                  )}
                  style={{ '--tw-ring-color': hColor } as React.CSSProperties}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleCompletion(habit)}
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 mt-0.5',
                          completed
                            ? 'border-emerald-500 bg-emerald-500 text-white scale-100'
                            : 'border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500'
                        )}
                      >
                        {completed && (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${hColor}18` }}>
                        <Icon className="h-5 w-5" style={{ color: hColor }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          onClick={() => setEditHabit(habit as Habit)}
                        >
                          {habit.title}
                        </div>

                        {(habit as any).description && (
                          <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1">
                            {(habit as any).description}
                          </div>
                        )}

                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <span className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white" style={{ backgroundColor: hColor }}>
                            {habit.type === 'daily' ? 'يومي' : habit.type === 'weekly' ? 'أسبوعي' : 'شهري'}
                          </span>

                          {habit.type === 'weekly' && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {habit.daysOfWeek.map(d => DAY_NAMES[d]).join('، ')}
                            </span>
                          )}
                          {habit.type === 'monthly' && (
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                              {habit.targetCount} {habit.targetCount === 1 ? 'مرة' : 'مرات'} / {
                                habit.period === 'start' ? 'بداية' : habit.period === 'middle' ? 'وسط' : 'نهاية'
                              } الشهر
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {habit.streak > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: (habit as any).color || '#f59e0b' }}>
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
                        onClick={() => setEditHabit(habit)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        aria-label="تعديل العادة"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Button>
                      <Button
                        variant="danger"
                        size="icon"
                        onClick={() => setDeleteConfirmId(habit.id)}
                        className="text-zinc-400 hover:text-rose-500"
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-700/40">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%`, backgroundColor: hColor }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {activeTab !== 'stats' && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 md:h-16 md:w-16"
          aria-label="إضافة عادة جديدة"
        >
          <Plus className="h-6 w-6 md:h-7 md:w-7" />
        </button>
      )}

      <AddEditHabitModal
        open={showAddModal}
        mode="add"
        allHabits={habits}
        onClose={() => setShowAddModal(false)}
        onSave={handleModalSave}
      />

      <AddEditHabitModal
        open={editHabit !== null}
        mode="edit"
        initialData={editHabit || undefined}
        allHabits={habits}
        onClose={() => setEditHabit(null)}
        onSave={handleEditSave}
      />

      <ConfirmDialog
        open={deleteConfirmId !== null}
        title="حذف العادة"
        message={`هل أنت متأكد من حذف عادة "${deleteTarget?.title || ''}"؟`}
        confirmLabel="نعم"
        cancelLabel="إلغاء"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
