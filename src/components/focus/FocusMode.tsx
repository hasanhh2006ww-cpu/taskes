'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/cn';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Coffee,
  Zap,
  Trophy,
} from 'lucide-react';

const WORK_MIN = 25;
const BREAK_MIN = 5;

function generateRainBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const duration = 4;
  const length = sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.97 + white * 0.03;
      data[i] = last * 3.5;
    }
  }
  return buffer;
}

function playChime(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(587.33, ctx.currentTime);
  osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.15);
  osc.frequency.setValueAtTime(880, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.6);
}

function playComplete(ctx: AudioContext) {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.3);
  });
}

export function FocusMode() {
  const {
    toggleFocusMode,
    activeTaskId,
    setActiveTaskId,
    focusSession,
    saveFocusSession,
    clearFocusSession,
  } = useUIStore();
  const {
    tasks,
    toggleComplete,
    toggleImportant,
    incrementPomodoro,
    getFilteredTasks,
  } = useTaskStore();

  const filtered = getFilteredTasks();
  const uncompleted = filtered.filter((t) => !t.completed);

  const [currentTaskId, setCurrentTaskId] = useState<string | null>(() => {
    if (activeTaskId) return activeTaskId;
    if (focusSession?.taskId) return focusSession.taskId;
    return uncompleted[0]?.id ?? null;
  });

  const task = tasks.find((t) => t.id === currentTaskId) ?? null;
  const currentIdx = filtered.findIndex((t) => t.id === currentTaskId);

  const [phase, setPhase] = useState<'work' | 'break'>(() => focusSession?.phase ?? 'work');
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (focusSession) return focusSession.secondsLeft;
    return WORK_MIN * 60;
  });
  const [completedSessions, setCompletedSessions] = useState(() => focusSession?.completedSessions ?? 0);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showComplete, setShowComplete] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const totalSec = phase === 'work' ? WORK_MIN * 60 : BREAK_MIN * 60;
  const progress = 1 - secondsLeft / totalSec;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const taskProgress = task
    ? Math.min(100, Math.round(((task.pomodoroCount + (phase === 'work' && running ? progress : 0)) / Math.max(1, task.pomodoroCount + 1)) * 100))
    : 0;

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);

  const startRain = useCallback(() => {
    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') ctx.resume();
      if (sourceRef.current) return;
      const buf = generateRainBuffer(ctx);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0.12;
      src.connect(gain).connect(ctx.destination);
      src.start();
      sourceRef.current = src;
    } catch { /* silent */ }
  }, [getCtx]);

  const stopRain = useCallback(() => {
    try {
      sourceRef.current?.stop();
      sourceRef.current?.disconnect();
      sourceRef.current = null;
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (running && soundOn) startRain();
    else stopRain();
  }, [running, soundOn, startRain, stopRain]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            try { playChime(getCtx()); } catch { /* silent */ }
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, getCtx]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(phase === 'work' ? WORK_MIN * 60 : BREAK_MIN * 60);
  }, [phase]);

  const switchPhase = useCallback(
    (next: 'work' | 'break') => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      setPhase(next);
      setSecondsLeft(next === 'work' ? WORK_MIN * 60 : BREAK_MIN * 60);
    },
    []
  );

  useEffect(() => {
    if (secondsLeft === 0 && !running) {
      if (phase === 'work') {
        if (currentTaskId) {
          incrementPomodoro(currentTaskId);
          setCompletedSessions((s) => s + 1);
        }
        setShowComplete(true);
        setTimeout(() => setShowComplete(false), 2000);
        switchPhase('break');
      } else {
        switchPhase('work');
      }
    }
  }, [secondsLeft, running, phase, switchPhase, currentTaskId, incrementPomodoro]);

  useEffect(() => {
    if (currentTaskId && (running || secondsLeft !== WORK_MIN * 60)) {
      saveFocusSession({
        taskId: currentTaskId,
        phase,
        secondsLeft,
        completedSessions,
      });
    }
  }, [currentTaskId, phase, secondsLeft, completedSessions, running, saveFocusSession]);

  useEffect(() => {
    return () => {
      stopRain();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, [stopRain]);

  const handleExit = () => {
    stopRain();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    clearFocusSession();
    toggleFocusMode();
  };

  const goNext = () => {
    if (filtered.length === 0) return;
    const i = filtered.findIndex((t) => t.id === currentTaskId);
    const next = filtered[(i + 1) % filtered.length];
    setCurrentTaskId(next.id);
    setActiveTaskId(next.id);
    resetTimer();
  };

  const goPrev = () => {
    if (filtered.length === 0) return;
    const i = filtered.findIndex((t) => t.id === currentTaskId);
    const prev = filtered[(i - 1 + filtered.length) % filtered.length];
    setCurrentTaskId(prev.id);
    setActiveTaskId(prev.id);
    resetTimer();
  };

  const handleComplete = () => {
    if (!task) return;
    toggleComplete(task.id);
    setShowComplete(true);
    try { playComplete(getCtx()); } catch { /* silent */ }
    setTimeout(() => {
      setShowComplete(false);
      goNext();
    }, 2200);
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 text-white"
    >
      {/* Completion overlay */}
      <AnimatePresence>
        {showComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.7, 1] }}
            >
              <Trophy className="h-20 w-20 text-amber-400" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-2xl font-bold text-white"
            >
              أحسنت! 🎉
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-2 text-sm text-white/50"
            >
              جلسة Pomodoro مكتملة
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit + Sound controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 md:top-6 md:right-6">
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white"
        >
          {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
        <button
          onClick={handleExit}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-rose-500/20 hover:text-rose-400"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Session stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-4 left-4 flex items-center gap-3 md:top-6 md:left-6"
      >
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50">
          <Zap className="h-3.5 w-3.5 text-amber-400" />
          <span>{completedSessions} جلسة مكتملة</span>
        </div>
        {task && (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-white/50">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{task.pomodoroCount} pomodoro</span>
          </div>
        )}
      </motion.div>

      {/* Phase toggle */}
      <div className="mb-8 flex items-center gap-1 rounded-xl bg-white/5 p-1">
        <button
          onClick={() => switchPhase('work')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            phase === 'work'
              ? 'bg-indigo-500/20 text-indigo-300'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <Clock className="h-4 w-4" />
          عمل
        </button>
        <button
          onClick={() => switchPhase('break')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
            phase === 'break'
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <Coffee className="h-4 w-4" />
          استراحة
        </button>
      </div>

      {/* Timer circle */}
      <div className="relative mb-8">
        <svg width="164" height="164" className="-rotate-90">
          <circle cx="82" cy="82" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <motion.circle
            cx="82"
            cy="82"
            r={radius}
            fill="none"
            stroke={phase === 'work' ? '#818cf8' : '#34d399'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={`${mm}:${ss}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-mono text-4xl font-bold tracking-wider text-white tabular-nums md:text-5xl"
          >
            {mm}:{ss}
          </motion.span>
          <span className="mt-1 text-xs text-white/40">
            {phase === 'work' ? `${WORK_MIN} دقيقة` : `${BREAK_MIN} دقائق`}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-10 flex items-center gap-3">
        <button
          onClick={goPrev}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRunning(!running)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-2xl transition-all',
            running
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>
        <button
          onClick={resetTimer}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={goNext}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Current task */}
      <AnimatePresence mode="wait">
        {task && (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="flex w-full max-w-md flex-col items-center px-4"
          >
            <div className="mb-3 flex items-center gap-2 text-xs text-white/30">
              <span>
                {currentIdx >= 0 ? currentIdx + 1 : 0} / {filtered.length}
              </span>
              {task.pomodoroCount > 0 && (
                <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300">
                  {task.pomodoroCount} pomodoro
                </span>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleComplete}
              className={cn(
                'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all',
                task.completed
                  ? 'border-emerald-400 bg-emerald-400/20 text-emerald-400'
                  : 'border-white/20 text-white/30 hover:border-emerald-400/50 hover:text-emerald-400/60'
              )}
            >
              <CheckCircle2 className="h-6 w-6" />
            </motion.button>

            <h2
              className={cn(
                'text-center text-xl font-semibold leading-relaxed md:text-2xl',
                task.completed ? 'text-white/40 line-through' : 'text-white'
              )}
            >
              {task.title}
            </h2>

            <button
              onClick={() => task && toggleImportant(task.id)}
              className="mt-4 text-xs text-white/30 transition-colors hover:text-amber-400"
            >
              {task.important ? '★ مهمة مميزة' : '☆ تحديد كمهمة مميزة'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {!task && (
        <div className="text-center text-white/30">
          <p className="text-lg">لا توجد مهام حالياً</p>
          <p className="mt-1 text-sm">أضف مهمة للبدء بالتركيز</p>
        </div>
      )}
    </motion.div>
  );
}
