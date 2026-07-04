'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  maxValue?: number;
  height?: number;
  showLabels?: boolean;
  className?: string;
}

export function BarChart({ data, maxValue, height = 120, showLabels = true, className }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);
  return (
    <div className={cn('flex items-end justify-between gap-1.5', className)} style={{ height }}>
      {data.map((d, i) => {
        const pct = d.value > 0 ? Math.max((d.value / max) * 100, 4) : 0;
        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1 h-full justify-end">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${pct}%` }}
              transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
              className={cn(
                'w-full rounded-t-md transition-colors',
                d.color ?? 'bg-emerald-400 dark:bg-emerald-500'
              )}
              style={{ minHeight: d.value > 0 ? '4px' : 0 }}
            />
            {showLabels && (
              <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500">{d.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
