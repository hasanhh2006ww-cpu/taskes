'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { HABIT_COLORS } from '@/lib/habitIcons';

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5 sm:gap-2">
      {HABIT_COLORS.map((c) => {
        const isSelected = selected === c.value;
        return (
          <motion.button
            key={c.value}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(c.value)}
            className={cn(
              'relative flex h-8 w-8 items-center justify-center rounded-full transition-all md:h-9 md:w-9',
              isSelected && 'ring-2 ring-offset-2 dark:ring-offset-zinc-900'
            )}
            style={{ backgroundColor: c.value, '--tw-ring-color': c.value } as React.CSSProperties}
            title={c.name}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <Check className="h-4 w-4 text-white drop-shadow-md" />
              </motion.div>
            )}
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 12px 2px ${c.value}40`,
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
