'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePlan } from '@/lib/ai-engine';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { cn } from '@/lib/cn';
import type { AIPlan, AIDayPlan } from '@/lib/ai-engine';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ListChecks,
  Calendar,
  BrainCircuit,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react';

export function AIAssistant() {
  const [goal, setGoal] = useState('');
  const [plan, setPlan] = useState<AIPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set());
  const [added, setAdded] = useState(false);

  const { addMultipleTasks } = useTaskStore();
  const { projects, addProject } = useProjectStore();

  const handleGenerate = useCallback(() => {
    const trimmed = goal.trim();
    if (!trimmed) return;
    setLoading(true);
    setPlan(null);
    setAdded(false);
    setExpandedDays(new Set());
    setTimeout(() => {
      try {
        const result = generatePlan(trimmed);
        setPlan(result);
        setExpandedDays(new Set([1]));
      } catch {
        /* silent */
      }
      setLoading(false);
    }, 800);
  }, [goal]);

  const handleAddAll = useCallback(() => {
    if (!plan) return;
    let projectId = '';
    const existing = projects.find((p) => p.name === plan.focus);
    if (existing) {
      projectId = existing.id;
    } else {
      addProject(plan.focus);
      projectId = useProjectStore.getState().projects.find((p) => p.name === plan.focus)?.id ?? '';
    }
    addMultipleTasks(
      plan.allTasks.map((task) => ({
        title: task.title,
        priority: task.priority,
        projectId: projectId || undefined,
      }))
    );
    setAdded(true);
  }, [plan, projects, addProject, addMultipleTasks]);

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const allAdded = added;
  const taskCount = plan?.allTasks.length ?? 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col overflow-y-auto px-4 pt-6 pb-8 sm:px-6 md:pt-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-indigo-100 p-3 dark:bg-indigo-950/40">
          <BrainCircuit className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 sm:text-3xl">
          المساعد الذكي
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          اكتب هدفك وسأقوم بتحويله إلى خطة متكاملة مع مهام يومية
        </p>
      </motion.div>

      {/* Input area */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="relative">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="مثال: أريد تعلم البرمجة خلال شهر"
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate();
            }}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              ⌘+Enter للإنشاء السريع
            </span>
            <button
              onClick={handleGenerate}
              disabled={loading || !goal.trim()}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all min-h-[44px]',
                loading || !goal.trim()
                  ? 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600'
                  : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]'
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحليل…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  إنشاء خطة
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading state */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div className="mb-4 flex gap-1.5">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:150ms]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:300ms]" />
            </div>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">جاري تحليل الهدف وإنشاء الخطة…</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {plan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-5 dark:border-indigo-900/30 dark:from-indigo-950/30 dark:to-zinc-900"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-2xl">{plan.emoji}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    {plan.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-[11px] font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                      <BrainCircuit className="h-3 w-3" />
                      {plan.focus}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      <Calendar className="h-3 w-3" />
                      {plan.totalDays} {plan.totalDays === 1 ? 'يوم' : 'أيام'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      <ListChecks className="h-3 w-3" />
                      {taskCount} مهمة
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Day-by-day breakdown */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                الخطة اليومية
              </h3>
              {plan.days.map((day, idx) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.04 }}
                >
                  <DayCard
                    day={day}
                    isExpanded={expandedDays.has(day.day)}
                    onToggle={() => toggleDay(day.day)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Add all button */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky bottom-0 rounded-2xl border border-zinc-200/60 bg-white/95 p-4 backdrop-blur-xl dark:border-zinc-700/60 dark:bg-zinc-950/95"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {allAdded ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4" />
                      تمت إضافة {taskCount} مهام بنجاح
                    </span>
                  ) : (
                    <span>
                      سيتم إنشاء {taskCount} مهمة تحت تصنيف &ldquo;{plan.focus}&rdquo;
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAddAll}
                  disabled={allAdded}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all min-h-[44px]',
                    allAdded
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-default'
                      : 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98]'
                  )}
                >
                  {allAdded ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      تمت الإضافة
                    </>
                  ) : (
                    <>
                      <ListChecks className="h-4 w-4" />
                      إضافة {taskCount} مهمة
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DayCard({ day, isExpanded, onToggle }: { day: AIDayPlan; isExpanded: boolean; onToggle: () => void }) {
  const totalMin = day.tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white transition-colors dark:border-zinc-800/60 dark:bg-zinc-900/50">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-start"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          {day.day}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            اليوم {day.day}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
            <span>{day.date}</span>
            <span>·</span>
            <span>{day.tasks.length} مهام</span>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{totalMin} د</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
              {day.tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                >
                  <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                    {task.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                        task.priority === 'high' && 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
                        task.priority === 'medium' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
                        task.priority === 'low' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      )}
                    >
                      {task.priority === 'high' ? 'عالي' : task.priority === 'medium' ? 'متوسط' : 'منخفض'}
                    </span>
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                      {task.estimatedMinutes} د
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
