'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import type { DailyHabit, WeeklyHabit, MonthlyHabit, WeeklyFrequency } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { Plus, Trash2, X } from 'lucide-react';
import { WEEKLY_FREQUENCIES, MONTH_PERIODS, getToday, getWeekKey, getMonthWeekKey } from '@/lib/constants';

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export function HabitTrackerPro() {
  const { habits, addHabit, deleteHabit, updateHabit, toggleDailyCompletion, toggleWeeklyCompletion, toggleMonthlyCompletion } = useHabitStore();

  const [activeTab, setActiveTab] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [modalWeeklyFreq, setModalWeeklyFreq] = useState<WeeklyFrequency>(3);
  const [modalWeeklyDays, setModalWeeklyDays] = useState<number[]>([1, 3, 5]);
  const [modalMonthlyPeriod, setModalMonthlyPeriod] = useState<'start' | 'middle' | 'end'>('middle');
  const [modalMonthlyTarget, setModalMonthlyTarget] = useState<number>(4);
  const [modalError, setModalError] = useState('');

  const filteredHabits = habits
    .filter((h) => activeTab === 'all' || h.type === activeTab)
    .sort((a, b) => b.createdAt - a.createdAt);

  function handleModalAdd() {
    if (!modalTitle.trim()) return;
    const exists = habits.some(
      (h) => h.title.toLowerCase() === modalTitle.trim().toLowerCase() && h.type === modalType
    );
    if (exists) {
      setModalError('يوجد عادة بنفس الاسم والنوع');
      return;
    }
    let options;
    if (modalType === 'weekly') {
      options = { frequency: modalWeeklyFreq, daysOfWeek: modalWeeklyDays };
    } else if (modalType === 'monthly') {
      options = { period: modalMonthlyPeriod, targetCount: modalMonthlyTarget };
    }
    addHabit(modalTitle.trim(), modalType, options);
    setModalTitle('');
    setModalWeeklyDays([1, 3, 5]);
    setModalError('');
    setShowAddModal(false);
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

  function toggleCompletion(habit: DailyHabit | WeeklyHabit | MonthlyHabit) {
    if (habit.type === 'daily') {
      toggleDailyCompletion(habit.id);
    } else if (habit.type === 'weekly') {
      toggleWeeklyCompletion(habit.id);
    } else if (habit.type === 'monthly') {
      toggleMonthlyCompletion(habit.id);
    }
  }

  function isCompletedToday(habit: DailyHabit | WeeklyHabit | MonthlyHabit): boolean {
    const today = getToday();
    if (habit.type === 'daily') return habit.completions[today] === true;
    if (habit.type === 'weekly') return habit.completedWeeks[getWeekKey(today)] === true;
    if (habit.type === 'monthly') return (habit.completedDays[getMonthWeekKey(today)] || 0) >= 1;
    return false;
  }

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">متتبع العادات</h1>
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          {habits.length} {habits.length === 1 ? 'عادة' : 'عادات'}
        </div>
      </div>

      <div className="px-4 pb-4 md:px-6">
        <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-1 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
          <div className="grid grid-cols-4 gap-1">
            {(['all', 'daily', 'weekly', 'monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                  activeTab === tab
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                )}
              >
                {tab === 'all' ? 'الكل' : tab === 'daily' ? 'يومي' : tab === 'weekly' ? 'أسبوعي' : 'شهري'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {habits.length === 0 && (
        <div className="mt-16 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">لا توجد عادات بعد</p>
          <p className="text-xs text-zinc-300 dark:text-zinc-600">
            اضغط على زر + لإضافة عادة جديدة
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-24 md:px-6">
        {activeTab !== 'all' && filteredHabits.length === 0 && habits.length > 0 && (
          <div className="mt-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            لا توجد عادات {activeTab === 'daily' ? 'يومية' : activeTab === 'weekly' ? 'أسبوعية' : 'شهرية'} بعد
          </div>
        )}

        {filteredHabits.map((habit) => {
          const completed = isCompletedToday(habit);
          return (
            <div key={habit.id} className="mb-3">
              <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm transition-colors dark:border-zinc-800/40 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => toggleCompletion(habit)}
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                        completed
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-zinc-300 dark:border-zinc-600'
                      )}
                    >
                      {completed && (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
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
                          className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                          onDoubleClick={() => handleEditStart(habit)}
                        >
                          {habit.title}
                        </div>
                      )}

                      <div className="mt-0.5 flex items-center gap-2">
                        <span className={cn(
                          'inline-block rounded-full px-2 py-0.5 text-[10px] font-medium',
                          habit.type === 'daily'
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                            : habit.type === 'weekly'
                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                            : 'bg-purple-100 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400'
                        )}>
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
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400">
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
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 end-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95 md:h-16 md:w-16"
        aria-label="إضافة عادة جديدة"
      >
        <Plus className="h-6 w-6 md:h-7 md:w-7" />
      </button>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:rounded-2xl sm:mx-4">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">إضافة عادة جديدة</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-800/30 dark:bg-rose-950/30 dark:text-rose-400">
                {modalError}
              </div>
            )}

            <div className="mb-4 space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">اسم العادة *</label>
              <Input
                placeholder="مثال: قراءة 30 دقيقة"
                value={modalTitle}
                onChange={(e) => { setModalTitle(e.target.value); setModalError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleModalAdd()}
                autoFocus
              />
            </div>

            <div className="mb-4 space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">نوع العادة</label>
              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setModalType(type)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                      modalType === type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                  >
                    {type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : 'شهري'}
                  </button>
                ))}
              </div>
            </div>

            {modalType === 'weekly' && (
              <div className="mb-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">التكرار</label>
                  <select
                    value={modalWeeklyFreq}
                    onChange={(e) => setModalWeeklyFreq(parseInt(e.target.value) as WeeklyFrequency)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {WEEKLY_FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الأيام</label>
                  <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map((day, index) => {
                      const isSelected = modalWeeklyDays.includes(index);
                      return (
                        <button
                          key={day}
                          onClick={() => {
                            setModalWeeklyDays(isSelected ? modalWeeklyDays.filter(d => d !== index) : [...modalWeeklyDays, index]);
                          }}
                          className={cn(
                            'rounded px-1 py-1 text-[10px] font-medium transition-all',
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
                          )}
                        >
                          {day.slice(0, 1)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {modalType === 'monthly' && (
              <div className="mb-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الفترة</label>
                  <select
                    value={modalMonthlyPeriod}
                    onChange={(e) => setModalMonthlyPeriod(e.target.value as 'start' | 'middle' | 'end')}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {MONTH_PERIODS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الهدف (عدد الأسابيع في الشهر)</label>
                  <select
                    value={modalMonthlyTarget}
                    onChange={(e) => setModalMonthlyTarget(parseInt(e.target.value))}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>{n} أسابيع</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1">
                إلغاء
              </Button>
              <Button variant="primary" onClick={handleModalAdd} className="flex-1 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600">
                حفظ العادة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
