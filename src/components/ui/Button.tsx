'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'icon';
  children: ReactNode;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-all duration-150 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        variant === 'ghost' &&
          'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
        variant === 'primary' &&
          'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm dark:shadow-indigo-500/20',
        variant === 'danger' &&
          'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30',
        size === 'sm' && 'h-10 px-2.5 text-xs gap-1 md:h-7 md:px-2',
        size === 'md' && 'h-11 px-3 text-sm gap-1.5 md:h-9',
        size === 'icon' && 'h-11 w-11 md:h-8 md:w-8',
        props.disabled && 'opacity-40 pointer-events-none',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
