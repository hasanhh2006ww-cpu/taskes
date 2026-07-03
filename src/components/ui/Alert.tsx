'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig = {
  info: {
    container: 'bg-sky-50 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800',
    icon: 'text-sky-500 dark:text-sky-400',
    title: 'text-sky-800 dark:text-sky-300',
    text: 'text-sky-700 dark:text-sky-400',
    Icon: Info,
  },
  success: {
    container: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800',
    icon: 'text-emerald-500 dark:text-emerald-400',
    title: 'text-emerald-800 dark:text-emerald-300',
    text: 'text-emerald-700 dark:text-emerald-400',
    Icon: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800',
    icon: 'text-amber-500 dark:text-amber-400',
    title: 'text-amber-800 dark:text-amber-300',
    text: 'text-amber-700 dark:text-amber-400',
    Icon: TriangleAlert,
  },
  danger: {
    container: 'bg-rose-50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800',
    icon: 'text-rose-500 dark:text-rose-400',
    title: 'text-rose-800 dark:text-rose-300',
    text: 'text-rose-700 dark:text-rose-400',
    Icon: AlertCircle,
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  const config = variantConfig[variant];
  const { Icon } = config;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        config.container,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.icon)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && <p className={cn('text-sm font-medium', config.title)}>{title}</p>}
        <div className={cn('text-sm', config.text)}>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="إغلاق"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
