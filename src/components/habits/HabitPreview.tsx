'use client';

import { getHabitIcon } from '@/lib/habitIcons';
import { cn } from '@/lib/cn';

interface HabitPreviewProps {
  title: string;
  description?: string;
  icon: string;
  color: string;
  type: 'daily' | 'weekly' | 'monthly';
}

export function HabitPreview({ title, description, icon, color, type }: HabitPreviewProps) {
  const Icon = getHabitIcon(icon);

  return (
    <div className="rounded-xl border border-zinc-200/60 bg-white/50 p-4 backdrop-blur-sm dark:border-zinc-800/40 dark:bg-zinc-900/40">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {title || 'اسم العادة'}
          </div>
          {description && (
            <div className="mt-0.5 truncate text-xs text-zinc-400 dark:text-zinc-500">
              {description}
            </div>
          )}
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
            style={{ backgroundColor: color }}
          >
            {type === 'daily' ? 'يومي' : type === 'weekly' ? 'أسبوعي' : 'شهري'}
          </span>
        </div>
      </div>
    </div>
  );
}
