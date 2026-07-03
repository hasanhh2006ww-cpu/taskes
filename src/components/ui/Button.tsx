'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
        variant === 'primary' &&
          'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm dark:shadow-emerald-500/20',
        variant === 'secondary' &&
          'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700',
        variant === 'ghost' &&
          'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
        variant === 'danger' &&
          'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30',
        size === 'sm' && 'h-10 px-2.5 text-xs gap-1 md:h-7 md:px-2',
        size === 'md' && 'h-11 px-3 text-sm gap-1.5 md:h-9',
        size === 'lg' && 'h-12 px-5 text-sm gap-2 md:h-10 md:px-4',
        size === 'icon' && 'h-11 w-11 md:h-8 md:w-8',
        (disabled || loading) && 'opacity-40 pointer-events-none',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
