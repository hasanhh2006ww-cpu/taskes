'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/cn';
import { PRIORITIES } from '@/lib/constants';
import { Calendar, Trash2, Star, X, Plus, Timer, ListChecks } from 'lucide-react';
import type { Priority, SubTask, ActivityLogEntry } from '@/lib/types';
import { useUIStore } from '@/store/useUIStore';

export function TaskDetail({ onClose }: { onClose?: () => void }) {
  const { tasks, activeTaskId, setActiveTaskId, updateTask, deleteTask, toggleComplete, toggleImportant, addSubtask, toggleSubtask, deleteSubtask, updateSubtask, addActivityLog, addFocusSession } =
    useTaskStore();
  const projects = useProjectStore((s) => s.projects);
  const { toggleFocusMode, setActiveTaskId: setUIActiveTaskId } = useUIStore();
  const task = tasks.find((t) => t.id === activeTaskId);

  const [editTitle, setEditTitle] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editSubtaskTitle, setEditSubtaskTitle] = useState('');

  function handleDrawerClose() {
    if (onClose) onClose();
    else setActiveTaskId(null);
  }

  const taskNotNull = task;

  useEffect(() => {
    if (taskNotNull) {
      setEditTitle(taskNotNull.title);
      setEditDesc(taskNotNull.description || '');
      setIsEditingDesc(false);
      setEditingSubtaskId(null);
    }
  }, [taskNotNull?.id]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 768) return;
    window.history.pushState(null, '');
    const onPopState = () => {
      if (onClose) onClose();
      else setActiveTaskId(null);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [onClose]);

  if (!taskNotNull) {
    const today = new Date();
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-zinc-200/60 px-4 py-4 dark:border-zinc-800/60">
          <h2 className="text-sm font-medium text-zinc-400 dark:text-zinc-500">التفاصيل</h2>
          <button
            onClick={handleDrawerClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6">
          <p className="text-3xl font-bold text-zinc-200 dark:text-zinc-700">
            {today.getDate()}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            {today.toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', year: 'numeric' })}
          </p>
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            ابدأ بإضافة مهمة جديدة
          </p>
        </div>
      </div>
    );
  }

  const t = taskNotNull;
  const project = projects.find((p) => p.id === t.projectId);
  const subtasks: SubTask[] = (t as any).subtasks || [];
  const activityLog: ActivityLogEntry[] = (t as any).activityLog || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
  const focusSessions = (t as any).focusSessions || 0;
  const totalFocusTime = (t as any).totalFocusTime || 0;

  function handleTitleBlur() {
    if (editTitle.trim() && editTitle.trim() !== t.title) {
      updateTask(t.id, { title: editTitle.trim() });
      addActivityLog(t.id, 'title_changed', 'تم تغيير عنوان المهمة');
    }
  }

  function handleDescBlur() {
    setIsEditingDesc(false);
    if (editDesc !== (t.description || '')) {
      updateTask(t.id, { description: editDesc || undefined });
      addActivityLog(t.id, 'description_updated', 'تم تحديث وصف المهمة');
    }
  }

  function handleAddSubtask() {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    addSubtask(t.id, title);
    addActivityLog(t.id, 'subtask_added', `تمت إضافة مهمة فرعية: ${title}`);
    setNewSubtaskTitle('');
  }

  function handleToggleSubtask(subtaskId: string) {
    const sub = subtasks.find((s) => s.id === subtaskId);
    toggleSubtask(t.id, subtaskId);
    if (sub) {
      addActivityLog(t.id, 'subtask_completed', sub.completed ? `تم إلغاء إكمال: ${sub.title}` : `تم إكمال: ${sub.title}`);
    }
  }

  function handleDeleteSubtask(subtaskId: string) {
    const sub = subtasks.find((s) => s.id === subtaskId);
    deleteSubtask(t.id, subtaskId);
    if (sub) addActivityLog(t.id, 'subtask_deleted', `تم حذف مهمة فرعية: ${sub.title}`);
  }

  function handleSubtaskEditBlur(subtaskId: string) {
    const title = editSubtaskTitle.trim();
    if (title) {
      updateSubtask(t.id, subtaskId, title);
      addActivityLog(t.id, 'subtask_updated', `تم تعديل مهمة فرعية إلى: ${title}`);
    }
    setEditingSubtaskId(null);
  }

  function handleFocusStart() {
    setUIActiveTaskId(t.id);
    addActivityLog(t.id, 'focus_session', 'بدأ جلسة تركيز');
    addFocusSession(t.id, 0);
    toggleFocusMode();
  }

  function handlePriorityChange(p: Priority) {
    updateTask(t.id, { priority: p });
    addActivityLog(t.id, 'priority_changed', `تم تغيير الأولوية إلى: ${p === 'low' ? 'منخفض' : p === 'medium' ? 'متوسط' : 'عالي'}`);
  }

  function handleDueDateChange(date: string) {
    updateTask(t.id, { dueDate: date || undefined });
    addActivityLog(t.id, 'due_date_changed', date ? `تم تغيير تاريخ الاستحقاق إلى ${date}` : 'تم إزالة تاريخ الاستحقاق');
  }

  function handleToggleComplete() {
    toggleComplete(t.id);
    addActivityLog(t.id, 'task_completed', t.completed ? 'تم إلغاء إكمال المهمة' : 'تم إكمال المهمة');
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleDrawerClose}
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      />
      <motion.div
        key={t.id}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white shadow-2xl dark:bg-zinc-950 sm:w-[420px] lg:w-[460px]"
      >
        {/* Fixed Header */}
        <div className="shrink-0 border-b border-zinc-200/60 px-4 py-3 dark:border-zinc-800/60">
          <div className="flex items-center justify-between gap-2">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="flex-1 bg-transparent text-base font-semibold text-zinc-900 outline-none placeholder-zinc-400 dark:text-zinc-100"
            />
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleToggleComplete}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                  t.completed
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                )}
              >
                {t.completed ? 'مكتمل' : 'قيد التنفيذ'}
              </button>
              <button
                onClick={handleDrawerClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-5">

          {/* Progress Bar (if subtasks exist) */}
          {subtasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>التقدم</span>
                <span>{completedSubtasks} / {subtasks.length}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200/60 dark:bg-zinc-700/40">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${subtaskProgress}%`,
                    backgroundColor: subtaskProgress === 100 ? '#10b981' : subtaskProgress > 50 ? '#6366f1' : '#f59e0b',
                  }}
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="mb-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500">الوصف</div>
            {isEditingDesc ? (
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                onBlur={handleDescBlur}
                autoFocus
                rows={3}
                className="w-full resize-none rounded-lg border border-zinc-200 bg-white/50 px-3 py-2 text-xs text-zinc-900 outline-none transition-all focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-indigo-600"
                placeholder="أضف وصفاً أو ملاحظات للمهمة..."
              />
            ) : (
              <div
                onClick={() => { setEditDesc(t.description || ''); setIsEditingDesc(true); }}
                className="min-h-[40px] cursor-text rounded-lg border border-transparent px-3 py-2 text-xs text-zinc-700 transition-all hover:border-zinc-200 dark:text-zinc-300 dark:hover:border-zinc-700"
              >
                {t.description ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{t.description}</p>
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500">أضف وصفاً أو ملاحظات للمهمة...</span>
                )}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <ListChecks className="h-3.5 w-3.5" />
              المهام الفرعية {subtasks.length > 0 && `(${completedSubtasks}/${subtasks.length})`}
            </div>

            <div className="mb-2 flex gap-2">
              <input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                placeholder="إضافة مهمة فرعية..."
                className="flex-1 rounded-lg border border-zinc-200 bg-white/50 px-3 py-2 text-xs text-zinc-900 outline-none placeholder-zinc-400 transition-all focus:border-indigo-300 focus:ring-1 focus:ring-indigo-300 dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:text-zinc-100 dark:focus:border-indigo-600"
              />
              <button
                onClick={handleAddSubtask}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-600 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" /> إضافة
              </button>
            </div>

            {subtasks.length === 0 ? (
              <p className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">لا توجد مهام فرعية بعد</p>
            ) : (
              <div className="space-y-1">
                {subtasks
                  .sort((a, b) => a.order - b.order)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40"
                    >
                      <button
                        onClick={() => handleToggleSubtask(sub.id)}
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all',
                          sub.completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-zinc-300 dark:border-zinc-600'
                        )}
                      >
                        {sub.completed && (
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>

                      {editingSubtaskId === sub.id ? (
                        <input
                          value={editSubtaskTitle}
                          onChange={(e) => setEditSubtaskTitle(e.target.value)}
                          onBlur={() => handleSubtaskEditBlur(sub.id)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubtaskEditBlur(sub.id)}
                          autoFocus
                          className="flex-1 rounded bg-white/80 px-1.5 py-0.5 text-xs text-zinc-900 outline-none ring-1 ring-indigo-300 dark:bg-zinc-800 dark:text-zinc-100 dark:ring-indigo-600"
                        />
                      ) : (
                        <span
                          onClick={() => { setEditingSubtaskId(sub.id); setEditSubtaskTitle(sub.title); }}
                          className={cn(
                            'flex-1 cursor-text text-xs transition-colors',
                            sub.completed
                              ? 'text-zinc-400 line-through dark:text-zinc-500'
                              : 'text-zinc-700 dark:text-zinc-300'
                          )}
                        >
                          {sub.title}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteSubtask(sub.id)}
                        className="shrink-0 text-zinc-300 opacity-0 transition-all hover:text-rose-500 group-hover:opacity-100 dark:text-zinc-600"
                        aria-label="حذف"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">التفاصيل</div>
            <div className="space-y-2.5 rounded-xl border border-zinc-200/60 bg-white/30 p-3 dark:border-zinc-800/40 dark:bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500 md:w-20">الحالة</span>
                <button
                  onClick={handleToggleComplete}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition-colors',
                    t.completed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                  )}
                >
                  {t.completed ? 'مكتمل' : 'قيد التنفيذ'}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500 md:w-20">الأولوية</span>
                <div className="flex gap-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      onClick={() => handlePriorityChange(p.value as Priority)}
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
                        t.priority === p.value
                          ? p.color
                          : 'text-zinc-400 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:bg-zinc-800'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">تاريخ الاستحقاق</span>
                <input
                  type="date"
                  value={t.dueDate || ''}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="rounded-lg border border-zinc-200 bg-white/50 px-2 py-1 text-xs text-zinc-700 outline-none dark:border-zinc-700/50 dark:bg-zinc-900/60 dark:text-zinc-300"
                />
              </div>

              {project && (
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500 md:w-20">المشروع</span>
                  <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium leading-4"
                    style={{ backgroundColor: project.color + '20', color: project.color }}
                  >
                    {project.name}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs font-medium text-zinc-400 dark:text-zinc-500 md:w-20">تاريخ الإنشاء</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(t.createdAt).toLocaleDateString('ar-SA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              {focusSessions > 0 && (
                <div className="flex items-center gap-2">
                  <Timer className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">جلسات التركيز</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">{focusSessions} جلسة{focusSessions !== 1 ? 'ات' : ''} ({totalFocusTime} دقيقة)</span>
                </div>
              )}
            </div>
          </div>

          {/* Statistics Card */}
          <div>
            <div className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">الإحصائيات</div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <div className="rounded-xl border border-zinc-200/60 bg-white/30 p-3 text-center dark:border-zinc-800/40 dark:bg-zinc-900/30">
                <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                  {subtasks.length > 0 ? subtaskProgress : t.completed ? 100 : 0}%
                </div>
                <div className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">الإنجاز</div>
              </div>
              <div className="rounded-xl border border-zinc-200/60 bg-white/30 p-3 text-center dark:border-zinc-800/40 dark:bg-zinc-900/30">
                <div className="text-lg font-bold text-zinc-800 dark:text-zinc-200">{completedSubtasks}/{subtasks.length}</div>
                <div className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">مهام فرعية</div>
              </div>
              <div className="rounded-xl border border-zinc-200/60 bg-white/30 p-3 text-center dark:border-zinc-800/40 dark:bg-zinc-900/30">
                <div className="text-lg font-bold text-indigo-500">{focusSessions}</div>
                <div className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">جلسات تركيز</div>
              </div>
              <div className="rounded-xl border border-zinc-200/60 bg-white/30 p-3 text-center dark:border-zinc-800/40 dark:bg-zinc-900/30">
                <div className="text-lg font-bold text-amber-500">{totalFocusTime}</div>
                <div className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500">دقيقة تركيز</div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          {activityLog.length > 0 && (
            <div>
              <div className="mb-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">النشاط الأخير</div>
              <div className="space-y-1.5">
                {[...activityLog].reverse().slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-start gap-2 rounded-lg px-2 py-1.5 transition-all hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30">
                    <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-zinc-600 dark:text-zinc-400">{log.message}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                        {new Date(log.timestamp).toLocaleString('ar-SA', {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="shrink-0 border-t border-zinc-200/60 px-4 py-3 safe-area-bottom dark:border-zinc-800/60">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleFocusStart}
              className="flex items-center gap-1.5 rounded-lg border border-indigo-200/60 bg-indigo-50/80 px-3 py-2 text-xs font-medium text-indigo-700 transition-all hover:bg-indigo-100/80 dark:border-indigo-800/40 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
            >
              <Timer className="h-3.5 w-3.5" />
              🎯 ابدأ التركيز
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleImportant(t.id)}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                  t.important
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300'
                )}
              >
                <Star className={cn('h-3.5 w-3.5', t.important && 'fill-amber-400')} />
              </button>
              <button
                onClick={() => deleteTask(t.id)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
