'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@/store/useUIStore';
import { useTaskStore } from '@/store/useTaskStore';
import { FOCUS_PRESETS } from '@/lib/constants';
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
  Settings,
  Link,
} from 'lucide-react';

function extractYoutubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
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
    focusSettings,
    updateFocusSettings,
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
    return focusSettings.workMin * 60;
  });
  const [completedSessions, setCompletedSessions] = useState(() => focusSession?.completedSessions ?? 0);
  const [running, setRunning] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [showComplete, setShowComplete] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [settingsWork, setSettingsWork] = useState(focusSettings.workMin);
  const [settingsBreak, setSettingsBreak] = useState(focusSettings.breakMin);
  const [settingsUrl, setSettingsUrl] = useState(focusSettings.youtubeUrl);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { workMin, breakMin } = focusSettings;
  const totalSec = phase === 'work' ? workMin * 60 : breakMin * 60;
  const progress = 1 - secondsLeft / totalSec;
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const getCtx = useCallback(() => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);

  const youtubeId = settingsUrl ? extractYoutubeId(settingsUrl) : null;

  const sendYTCommand = useCallback((command: string) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: [] }),
      '*'
    );
  }, []);

  useEffect(() => {
    if (!running || !soundOn || !youtubeId) {
      try { sendYTCommand('pauseVideo'); } catch { /* silent */ }
      return;
    }
    try { sendYTCommand('playVideo'); } catch { /* silent */ }
  }, [running, soundOn, youtubeId, sendYTCommand]);

  useEffect(() => {
    if (!running) return;
    const initialSec = secondsLeft;
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newSecs = Math.max(0, initialSec - elapsed);
      setSecondsLeft(newSecs);
      if (newSecs <= 0) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setRunning(false);
        try { playChime(getCtx()); } catch { /* silent */ }
      }
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, getCtx]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSecondsLeft(phase === 'work' ? workMin * 60 : breakMin * 60);
  }, [phase, workMin, breakMin]);

  const switchPhase = useCallback(
    (next: 'work' | 'break') => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setRunning(false);
      setPhase(next);
      setSecondsLeft(next === 'work' ? workMin * 60 : breakMin * 60);
    },
    [workMin, breakMin]
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
    if (currentTaskId && (running || secondsLeft !== workMin * 60)) {
      saveFocusSession({
        taskId: currentTaskId,
        phase,
        secondsLeft,
        completedSessions,
      });
    }
  }, [currentTaskId, phase, secondsLeft, completedSessions, running, saveFocusSession, workMin]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  const handleExit = () => {
    try { sendYTCommand('pauseVideo'); } catch { /* silent */ }
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

  const saveSettings = () => {
    const w = Math.max(1, Math.min(180, settingsWork));
    const b = Math.max(1, Math.min(60, settingsBreak));
    updateFocusSettings({ workMin: w, breakMin: b, youtubeUrl: settingsUrl });
    setSettingsWork(w);
    setSettingsBreak(b);
    setPhase(phase);
    setSecondsLeft(phase === 'work' ? w * 60 : b * 60);
    setShowSettings(false);
  };

  const applyPreset = (work: number, brk: number) => {
    setSettingsWork(work);
    setSettingsBreak(brk);
    updateFocusSettings({ workMin: work, breakMin: brk });
    setSecondsLeft(phase === 'work' ? work * 60 : brk * 60);
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
      {/* Hidden YouTube iframe */}
      {youtubeId && (
        <iframe
          ref={iframeRef}
          width="0"
          height="0"
          className="pointer-events-none absolute opacity-0"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&loop=1&playlist=${youtubeId}`}
          allow="autoplay"
          title="background audio"
        />
      )}

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
              أحسنت!
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

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[115] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-5 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">إعدادات التركيز</h3>
                <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Presets */}
              <div className="mb-4">
                <label className="mb-2 block text-xs text-white/40">Presets</label>
                <div className="flex gap-2">
                  {FOCUS_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.work, p.break)}
                      className={cn(
                        'flex-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-all min-h-[44px] sm:min-h-0 sm:py-2',
                        settingsWork === p.work && settingsBreak === p.break
                          ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom times */}
              <div className="mb-4 flex gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/40">عمل (دقيقة)</label>
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={settingsWork}
                    onChange={(e) => setSettingsWork(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none min-h-[44px] focus:border-indigo-500/50 sm:min-h-0 sm:py-2"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-white/40">استراحة (دقيقة)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={settingsBreak}
                    onChange={(e) => setSettingsBreak(Number(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none min-h-[44px] focus:border-indigo-500/50 sm:min-h-0 sm:py-2"
                  />
                </div>
              </div>

              {/* YouTube URL */}
              <div className="mb-4">
                <label className="mb-1 block text-xs text-white/40">رابط YouTube للصوت</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                    <input
                      type="url"
                      value={settingsUrl}
                      onChange={(e) => setSettingsUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pe-3 ps-8 text-sm text-white outline-none placeholder:text-white/20 min-h-[44px] focus:border-indigo-500/50 sm:min-h-0 sm:py-2"
                    />
                  </div>
                </div>
                {youtubeId && (
                  <p className="mt-1.5 text-[10px] text-emerald-400/70">✓ رابط صالح</p>
                )}
              </div>

              <button
                onClick={saveSettings}
                className="w-full rounded-lg bg-indigo-500 py-3 text-sm font-medium text-white transition-colors min-h-[44px] hover:bg-indigo-600"
              >
                حفظ
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top controls */}
      <div className="absolute top-3 right-3 flex items-center gap-2 sm:top-4 sm:right-4 md:top-6 md:right-6">
        <button
          onClick={() => {
            setSoundOn(!soundOn);
            if (soundOn) try { sendYTCommand('pauseVideo'); } catch { /* silent */ }
          }}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white md:h-10 md:w-10"
        >
          {soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
        <button
          onClick={() => setShowSettings(true)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-white/20 hover:text-white md:h-10 md:w-10"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={handleExit}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white/70 backdrop-blur-sm transition-colors hover:bg-rose-500/20 hover:text-rose-400 md:h-10 md:w-10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Session stats */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="absolute top-3 left-3 flex items-center gap-2 sm:top-4 sm:left-4 md:top-6 md:left-6"
      >
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-[11px] text-white/50 sm:px-3 sm:text-xs">
          <Zap className="h-3 w-3 text-amber-400 sm:h-3.5 sm:w-3.5" />
          <span>{completedSessions} جلسة</span>
        </div>
        {task && task.pomodoroCount > 0 && (
          <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2 py-1.5 text-[11px] text-white/50 sm:px-3 sm:text-xs">
            <Clock className="h-3 w-3 text-indigo-400 sm:h-3.5 sm:w-3.5" />
            <span>{task.pomodoroCount} pom</span>
          </div>
        )}
      </motion.div>

      {/* Phase toggle */}
      <div className="mb-6 flex items-center gap-1 rounded-xl bg-white/5 p-1 sm:mb-8">
        <button
          onClick={() => switchPhase('work')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:gap-2 sm:px-4',
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
            'flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:gap-2 sm:px-4',
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
      <div className="relative mb-6 sm:mb-8">
        <svg width="140" height="140" className="-rotate-90 sm:w-[164px] sm:h-[164px]">
          <circle cx="70" cy="70" r={60} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" className="sm:hidden" />
          <motion.circle
            cx="70"
            cy="70"
            r={60}
            fill="none"
            stroke={phase === 'work' ? '#818cf8' : '#34d399'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 60}
            initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progress) }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="sm:hidden"
          />
          <circle cx="82" cy="82" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" className="hidden sm:block" />
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
            className="hidden sm:block"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={`${mm}:${ss}`}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="font-mono text-3xl font-bold tracking-wider text-white tabular-nums sm:text-4xl md:text-5xl"
          >
            {mm}:{ss}
          </motion.span>
          <span className="mt-1 text-[11px] text-white/40 sm:text-xs">
            {phase === 'work' ? `${workMin} دقيقة` : `${breakMin} دقائق`}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-8 flex items-center gap-2 sm:mb-10 sm:gap-3">
        <button
          onClick={goPrev}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white md:h-11 md:w-11"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setRunning(!running)}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-2xl transition-all sm:h-14 sm:w-14',
            running
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          )}
        >
          {running ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>
        <button
          onClick={resetTimer}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white md:h-11 md:w-11"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={goNext}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white md:h-11 md:w-11"
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
                'mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all sm:h-12 sm:w-12',
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
              className="mt-4 min-h-[44px] px-4 text-xs text-white/30 transition-colors hover:text-amber-400"
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
