'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/cn';
import { Search, ListTodo, Calendar, Star, Moon, Sun, Plus } from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFilter } = useTaskStore();
  const { addProject } = useProjectStore();
  const { darkMode, toggleDarkMode } = useUIStore();

  const commands: Command[] = [
    { id: 'all', label: 'انتقال إلى جميع المهام', icon: <ListTodo className="h-4 w-4" />, action: () => setFilter('all') },
    { id: 'today', label: 'انتقال إلى مهام اليوم', icon: <Calendar className="h-4 w-4" />, action: () => setFilter('today') },
    { id: 'important', label: 'المهمة', icon: <Star className="h-4 w-4" />, action: () => setFilter('important') },
    { id: 'completed', label: 'المنجزة', icon: <ListTodo className="h-4 w-4" />, action: () => setFilter('completed') },
    {
      id: 'theme',
      label: `تبديل إلى الوضع ${darkMode ? 'الفاتح' : 'الليلي'}`,
      icon: darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
      action: () => toggleDarkMode(),
    },
    {
      id: 'project',
      label: 'مشروع جديد',
      icon: <Plus className="h-4 w-4" />,
      action: () => {
        const name = prompt('اسم المشروع:');
        if (name?.trim()) addProject(name.trim());
      },
    },
  ];

  const filtered = query
    ? commands.filter((c) => c.label.includes(query))
    : commands;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((p) => !p);
        setQuery('');
      }
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (window.innerWidth < 768) {
      window.history.pushState(null, '');
    }
    const onPopState = () => setOpen(false);
    window.addEventListener('popstate', onPopState);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('popstate', onPopState);
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        setOpen(false);
      }
    },
    [filtered, selectedIndex]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh] sm:pt-[15vh]"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-900/95"
          >
            <div className="flex items-center gap-3 border-b border-zinc-200/50 px-4 py-3 dark:border-zinc-800/50">
              <Search className="h-4 w-4 shrink-0 text-zinc-400" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                onKeyDown={handleKeyDown}
                placeholder="اكتب أمراً..."
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500"
              />
              <kbd className="shrink-0 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[11px] text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500">
                ESC
              </kbd>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => { cmd.action(); setOpen(false); }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    i === selectedIndex
                      ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/60'
                  )}
                >
                  {cmd.icon}
                  {cmd.label}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-zinc-400">لا توجد نتائج</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
