'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { HABIT_ICON_CATEGORIES, getIconByName } from '@/lib/habitIcons';

interface IconPickerProps {
  selected: string;
  onSelect: (name: string) => void;
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  function toggleCategory(label: string) {
    setExpandedCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  const filteredCategories = HABIT_ICON_CATEGORIES.map((cat) => ({
    ...cat,
    items: cat.items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase())),
  })).filter((cat) => cat.items.length > 0);

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث عن أيقونة..."
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pe-3 ps-9 text-xs text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>

      {/* Icon gallery */}
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {filteredCategories.map((cat) => {
          const expanded = expandedCategories[cat.label] !== false;
          return (
            <div key={cat.label}>
              <button
                onClick={() => toggleCategory(cat.label)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <span>{cat.label} ({cat.items.length})</span>
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-6 gap-1 p-1 md:grid-cols-8">
                      {cat.items.map((item) => {
                        const Icon = getIconByName(item.name);
                        const isSelected = selected === item.name;
                        return (
                          <motion.button
                            key={item.name}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onSelect(item.name)}
                            className={cn(
                              'flex flex-col items-center justify-center rounded-lg p-1.5 transition-all',
                              isSelected
                                ? 'bg-emerald-100 ring-2 ring-emerald-400 dark:bg-emerald-900/30 dark:ring-emerald-500'
                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            )}
                            title={item.name}
                          >
                            <Icon className={cn('h-5 w-5', isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400')} />
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
