'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  variant = 'default',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' ? 'py-16' : 'py-8',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className={cn(
          'mb-4 flex items-center justify-center rounded-3xl bg-emerald-50/80 dark:bg-emerald-900/20',
          variant === 'default' ? 'h-20 w-20' : 'h-16 w-16'
        )}
      >
        <Icon
          className={cn(
            'text-emerald-300 dark:text-emerald-700',
            variant === 'default' ? 'h-10 w-10' : 'h-8 w-8'
          )}
          strokeWidth={1.5}
        />
      </motion.div>

      <h3
        className={cn(
          'font-semibold text-zinc-800 dark:text-zinc-100',
          variant === 'default' ? 'text-base' : 'text-sm'
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'mt-1.5 text-zinc-400 dark:text-zinc-500',
          variant === 'default' ? 'text-sm' : 'text-xs'
        )}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4"
        >
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
