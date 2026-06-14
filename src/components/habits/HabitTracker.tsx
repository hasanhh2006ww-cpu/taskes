'use client';

import { useState } from 'react';
import { useHabitStore } from '@/store/useHabitStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export function HabitTracker() {
  const { habits, addHabit, deleteHabit, toggleCompletion, reorderHabits, updateHabit } = useHabitStore();
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  function handleAdd() {
    if (!newTitle.trim()) return;
    addHabit(newTitle.trim());
    setNewTitle('');
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

  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex items-center justify-between px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">متتبع العادات</h1>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 md:text-sm">
          {habits.length} {habits.length === 1 ? 'عادة' : 'عادات'}
        </span>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200/60 bg-white/50 px-3 py-2.5 backdrop-blur-sm transition-colors dark:border-zinc-800/40 dark:bg-zinc-900/40 dark:focus-within:border-zinc-700/60">
          <Plus className="h-4 w-4 shrink-0 text-zinc-400" />
          <Input
            placeholder="إضافة عادة يومية جديدة..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6 md:px-6">
        {habits.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <p className="text-sm text-zinc-400 dark:text-zinc-500">لا توجد عادات بعد</p>
            <p className="text-xs text-zinc-300 dark:text-zinc-600">
              اكتب أعلاه واضغط Enter للإضافة
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {habits.map((habit) => {
              const completedToday = habit.completions[today] === true;
              return (
                <div
                  key={habit.id}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-zinc-200/60 bg-white/50 px-3 py-3 backdrop-blur-sm transition-colors',
                    'dark:border-zinc-800/40 dark:bg-zinc-900/40',
                    'hover:border-zinc-300/60 dark:hover:border-zinc-700/60'
                  )}
                >
                  <GripVertical className="h-5 w-5 text-zinc-300 cursor-grab active:cursor-grabbing shrink-0 dark:text-zinc-600" />

                  <div className="flex-1 min-w-0">
                    {editingId === habit.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleEditSave(habit.id)}
                          onBlur={() => handleEditSave(habit.id)}
                          autoFocus
                          className="text-base"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2" onDoubleClick={() => handleEditStart(habit)}>
                        <input
                          type="checkbox"
                          checked={completedToday}
                          onChange={() => toggleCompletion(habit.id)}
                          className="h-5 w-5 rounded border-zinc-300 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span
                          className={cn(
                            'text-base break-words',
                            completedToday ? 'line-through text-zinc-400 dark:text-zinc-500' : 'text-zinc-900 dark:text-zinc-100'
                          )}
                        >
                          {habit.title}
                        </span>
                      </div>
                    )}
                  </div>

                  {habit.streak > 0 && (
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-500 dark:text-amber-400">
                      <span>🔥</span>
                      <span>{habit.streak}</span>
                    </span>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}