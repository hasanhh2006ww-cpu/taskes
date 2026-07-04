'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/useTaskStore';
import { cn } from '@/lib/cn';
import { Plus, X } from 'lucide-react';
import { logger } from '@/lib/logger';

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTask } = useTaskStore();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), priority: 'medium' });
    logger.info('Quick task added', { title: title.trim() });
    setTitle('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[20vh]"
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200/50 bg-white shadow-xl dark:border-zinc-700/50 dark:bg-zinc-900"
          >
            <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3">
              <Plus className="h-5 w-5 shrink-0 text-emerald-500" />
              <input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أضف مهمة سريعة..."
                className="flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder-zinc-400 dark:text-zinc-100 dark:placeholder-zinc-500"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
