'use client';

import { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useHabitStore } from '@/store/useHabitStore';
import { useTaskStore } from '@/store/useTaskStore';
import { saveToStorage, loadFromStorage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { Moon, Sun, SunDim, Download, Upload, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const FOCUS_DURATIONS = [15, 25, 30, 45, 60];

export function SettingsView() {
  const { darkMode, toggleDarkMode } = useUIStore();
  const [focusDuration, setFocusDuration] = useState(
    loadFromStorage<number>(STORAGE_KEYS.FOCUS_DURATION, 25)
  );
  const [completedFilter, setCompletedFilter] = useState(
    loadFromStorage<'keep' | 'auto-clear'>('completedFilter', 'keep')
  );
  const [resetting, setResetting] = useState(false);

  function handleDarkMode() {
    toggleDarkMode();
  }

  function handleFocusDuration(minutes: number) {
    setFocusDuration(minutes);
    saveToStorage(STORAGE_KEYS.FOCUS_DURATION, minutes);
    toast.success(`مدة التركيز: ${minutes} دقيقة`);
  }

  function handleCompletedFilter(value: 'keep' | 'auto-clear') {
    setCompletedFilter(value);
    saveToStorage('completedFilter', value);
  }

  function handleExportAll() {
    const data = {
      tasks: useTaskStore.getState().tasks,
      habits: useHabitStore.getState().habits,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-taske-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير جميع البيانات بنجاح');
  }

  function handleImportAll() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.tasks) useTaskStore.getState().setTasks(data.tasks);
          if (data.habits) useHabitStore.getState().setHabits(data.habits);
          toast.success('تم استيراد البيانات بنجاح');
        } catch {
          toast.error('خطأ في قراءة الملف');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function handleResetAll() {
    setResetting(true);
  }

  function confirmReset() {
    useTaskStore.getState().setTasks([]);
    useHabitStore.getState().setHabits([]);
    saveToStorage(STORAGE_KEYS.TASKS, []);
    saveToStorage(STORAGE_KEYS.HABITS, []);
    setResetting(false);
    toast.success('تم حذف جميع البيانات');
  }

  const SettingCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn(
      'rounded-2xl border border-zinc-200/60 bg-white p-5 shadow-sm',
      'dark:border-zinc-800 dark:bg-zinc-900/80',
      className
    )}>
      {children}
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-zinc-50 dark:bg-[#0A0E17]">
      <div className="px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">الإعدادات</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 md:px-6 space-y-4">
        <SettingCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">الوضع الليلي</p>
                <p className="text-xs text-zinc-400">تغيير مظهر التطبيق</p>
              </div>
            </div>
            <button
              onClick={handleDarkMode}
              className={cn(
                'relative h-7 w-12 rounded-full transition-colors',
                darkMode ? 'bg-emerald-500' : 'bg-zinc-300'
              )}
            >
              <div className={cn(
                'absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform',
                darkMode ? 'translate-x-5.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
        </SettingCard>

        <SettingCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-500/10">
              <SunDim className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">مدة جلسة التركيز</p>
              <p className="text-xs text-zinc-400">اختيار مدة جلسة التركيز الافتراضية</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOCUS_DURATIONS.map((m) => (
              <button
                key={m}
                onClick={() => handleFocusDuration(m)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  focusDuration === m
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                )}
              >
                {m} دقيقة
              </button>
            ))}
          </div>
        </SettingCard>

        <SettingCard>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10">
              <Download className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">البيانات</p>
              <p className="text-xs text-zinc-400">تصدير أو استيراد جميع البيانات</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
            >
              <Download className="h-4 w-4" />
              تصدير
            </button>
            <button
              onClick={handleImportAll}
              className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
            >
              <Upload className="h-4 w-4" />
              استيراد
            </button>
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              حذف الكل
            </button>
          </div>
        </SettingCard>
      </div>

      {resetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">تأكيد الحذف</h3>
            <p className="mt-2 text-sm text-zinc-500">سيتم حذف جميع المهام والعادات بشكل دائم. هل أنت متأكد؟</p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setResetting(false)}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
              >
                إلغاء
              </button>
              <button
                onClick={confirmReset}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600"
              >
                نعم، احذف الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
