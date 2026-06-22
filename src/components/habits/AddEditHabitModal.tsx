'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { X, Palette } from 'lucide-react';
import type { Habit, WeeklyFrequency } from '@/lib/types';
import { WEEKLY_FREQUENCIES, MONTH_PERIODS } from '@/lib/constants';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { HabitPreview } from './HabitPreview';

const DAY_NAMES = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

interface AddEditHabitModalProps {
  open: boolean;
  mode: 'add' | 'edit';
  initialData?: Habit;
  allHabits: Habit[];
  onClose: () => void;
  onSave: (title: string, type: 'daily' | 'weekly' | 'monthly', options?: Record<string, unknown>) => void;
}

export function AddEditHabitModal({ open, mode, initialData, allHabits, onClose, onSave }: AddEditHabitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [weeklyFreq, setWeeklyFreq] = useState<WeeklyFrequency>(3);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3, 5]);
  const [monthlyPeriod, setMonthlyPeriod] = useState<'start' | 'middle' | 'end'>('middle');
  const [monthlyTarget, setMonthlyTarget] = useState<number>(4);
  const [selectedIcon, setSelectedIcon] = useState('Flame');
  const [selectedColor, setSelectedColor] = useState('#f59e0b');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setType(initialData.type);
      setSelectedIcon(initialData.icon || 'Flame');
      setSelectedColor(initialData.color || '#f59e0b');
      if (initialData.type === 'weekly') {
        setWeeklyFreq(initialData.frequency);
        setWeeklyDays(initialData.daysOfWeek);
      } else if (initialData.type === 'monthly') {
        setMonthlyPeriod(initialData.period);
        setMonthlyTarget(initialData.targetCount);
      } else {
        setWeeklyFreq(3);
        setWeeklyDays([1, 3, 5]);
        setMonthlyPeriod('middle');
        setMonthlyTarget(4);
      }
    } else {
      setTitle('');
      setDescription('');
      setType('daily');
      setSelectedIcon('Flame');
      setSelectedColor('#f59e0b');
      setWeeklyFreq(3);
      setWeeklyDays([1, 3, 5]);
      setMonthlyPeriod('middle');
      setMonthlyTarget(4);
    }
    setError('');
  }, [open, mode, initialData]);

  if (!open) return null;

  function handleSave() {
    if (!title.trim()) return;
    const exists = allHabits.some(
      (h) => h.title.toLowerCase() === title.trim().toLowerCase() && h.type === type && h.id !== initialData?.id
    );
    if (exists) {
      setError('يوجد عادة بنفس الاسم والنوع');
      return;
    }
    let options: Record<string, unknown> = { icon: selectedIcon, color: selectedColor, description: description.trim() };
    if (type === 'weekly') {
      options = { ...options, frequency: weeklyFreq, daysOfWeek: weeklyDays };
    } else if (type === 'monthly') {
      options = { ...options, period: monthlyPeriod, targetCount: monthlyTarget };
    }
    onSave(title.trim(), type, options);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[95vw] md:max-w-2xl lg:max-w-3xl max-h-[92vh] md:max-h-[90vh] rounded-t-2xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 md:px-5 md:pt-5 shrink-0">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {mode === 'add' ? 'إضافة عادة جديدة' : 'تعديل العادة'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 pb-2 md:px-5">
        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600 dark:border-rose-800/30 dark:bg-rose-950/30 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="mb-3 space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">اسم العادة *</label>
          <Input
            placeholder="مثال: قراءة 30 دقيقة"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>

        <div className="mb-3 space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">وصف العادة (اختياري)</label>
          <textarea
            placeholder="وصف قصير للعادة..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
            rows={2}
          />
        </div>

        <div className="mb-3 space-y-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">نوع العادة</label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                  type === t
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
                )}
              >
                {t === 'daily' ? 'يومي' : t === 'weekly' ? 'أسبوعي' : 'شهري'}
              </button>
            ))}
          </div>
        </div>

        {type === 'weekly' && (
          <div className="mb-3 space-y-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">التكرار</label>
              <select
                value={weeklyFreq}
                onChange={(e) => setWeeklyFreq(parseInt(e.target.value) as WeeklyFrequency)}
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
                  const isSelected = weeklyDays.includes(index);
                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setWeeklyDays(isSelected ? weeklyDays.filter(d => d !== index) : [...weeklyDays, index]);
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

        {type === 'monthly' && (
          <div className="mb-3 space-y-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الفترة</label>
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
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الهدف (عدد الأسابيع في الشهر)</label>
              <select
                value={monthlyTarget}
                onChange={(e) => setMonthlyTarget(parseInt(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {[1, 2, 3, 4].map((n) => (
                  <option key={n} value={n}>{n} أسابيع</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Customize Habit */}
        <div className="mb-3 rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-2.5 dark:border-zinc-700/60 dark:bg-zinc-800/30">
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-zinc-500" />
            <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">تخصيص العادة</h3>
          </div>

          {/* Live Preview */}
          <div className="mb-2">
            <HabitPreview title={title} description={description} icon={selectedIcon} color={selectedColor} type={type} />
          </div>

          {/* Color Picker */}
          <div className="mb-2 space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">اللون</label>
            <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">الأيقونة</label>
            <IconPicker selected={selectedIcon} onSelect={setSelectedIcon} />
          </div>
        </div>

        </div>
        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200/60 dark:border-zinc-800/40 backdrop-blur px-4 py-3 md:px-5 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="flex-1">إلغاء</Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {mode === 'add' ? 'حفظ العادة' : 'تحديث العادة'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
