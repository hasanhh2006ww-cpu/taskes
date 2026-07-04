'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({ value, max, color, height = 8, showLabel, className }: ProgressBarProps) {
  const safeVal = Number.isFinite(value) ? Math.max(0, value) : 0;
  const safeMax = Number.isFinite(max) ? Math.max(0, max) : 1;
  const pct = safeMax > 0 ? Math.min((safeVal / safeMax) * 100, 100) : 0;

  return (
    <div className={cn('relative', className)}>
      <div
        className="overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn(
            'h-full rounded-full transition-colors',
            color ?? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
          )}
        />
      </div>
      {showLabel && (
        <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
          {safeVal}/{safeMax}
        </span>
      )}
    </div>
  );
}
