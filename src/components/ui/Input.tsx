'use client';

import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full bg-transparent text-sm text-zinc-900 placeholder-zinc-400 outline-none',
        'dark:text-zinc-100 dark:placeholder-zinc-500',
        className
      )}
      {...props}
    />
  );
}
