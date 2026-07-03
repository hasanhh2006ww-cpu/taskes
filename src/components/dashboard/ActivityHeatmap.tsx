'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';

const SQUARE_SIZE = 12;
const SQUARE_GAP = 3;
const WEEKS = 52;
const DAYS = 7;
const TOTAL_DAYS = WEEKS * DAYS;

const MONTH_NAMES_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const DAY_LABELS_AR = ['أحد', 'إثن', 'ثلاث', 'أربع', 'خميس', 'جمعة', 'سبت'];

function getColor(count: number): string {
  if (count === 0) return '#E5E7EB';
  if (count <= 2) return '#A7F3D0';
  if (count <= 4) return '#34D399';
  return '#059669';
}

function getDarkColor(count: number): string {
  if (count === 0) return '#27272A';
  if (count <= 2) return '#064E3B';
  if (count <= 4) return '#10B981';
  return '#34D399';
}

function formatArabicDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat('ar-SA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

function formatTooltipTasks(count: number): string {
  if (count === 0) return 'لا توجد مهام';
  if (count === 1) return 'مهمة واحدة مكتملة';
  if (count === 2) return 'مهمتان مكتملتان';
  if (count >= 3 && count <= 10) return `${count} مهام مكتملة`;
  return `${count} مهمة مكتملة`;
}

interface DayCell {
  date: Date;
  dateStr: string;
  count: number;
  weekIndex: number;
  dayIndex: number;
}

function generateActivityData(): DayCell[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: DayCell[] = [];
  const seed = today.getTime();

  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const dayIndex = date.getDay();
    const daysSinceToday = i;
    const weekIndex = WEEKS - 1 - Math.floor(daysSinceToday / 7);

    const pseudoRandom = Math.abs(Math.sin(seed + i * 7919) * 10000) % 1;
    let count = 0;
    if (i < 7) {
      count = Math.floor(pseudoRandom * 6);
    } else if (i < 30) {
      count = Math.floor(pseudoRandom * 7);
    } else if (i < 90) {
      count = Math.floor(pseudoRandom * 6);
    } else if (i < 180) {
      count = Math.floor(pseudoRandom * 5);
    } else {
      count = Math.floor(pseudoRandom * 4);
    }

    if (dayIndex === 5 || dayIndex === 6) {
      count = Math.floor(count * 0.4);
    }

    cells.push({
      date,
      dateStr: date.toISOString().split('T')[0],
      count,
      weekIndex,
      dayIndex,
    });
  }

  return cells;
}

interface MonthLabel {
  name: string;
  weekIndex: number;
}

function getMonthLabels(cells: DayCell[]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let lastMonth = -1;

  cells.forEach((cell) => {
    const month = cell.date.getMonth();
    if (month !== lastMonth) {
      labels.push({
        name: MONTH_NAMES_AR[month],
        weekIndex: cell.weekIndex,
      });
      lastMonth = month;
    }
  });

  return labels;
}

export function ActivityHeatmap() {
  const cells = useMemo(() => generateActivityData(), []);
  const monthLabels = useMemo(() => getMonthLabels(cells), [cells]);
  const [hoveredCell, setHoveredCell] = useState<DayCell | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const grid: DayCell[][] = useMemo(() => {
    const grid: DayCell[][] = Array.from({ length: WEEKS }, () => Array(DAYS).fill(null));
    cells.forEach((cell) => {
      grid[cell.weekIndex][cell.dayIndex] = cell;
    });
    return grid;
  }, [cells]);

  const isDarkMode = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const totalTasks = useMemo(
    () => cells.reduce((sum, c) => sum + c.count, 0),
    [cells]
  );

  const activeDays = useMemo(
    () => cells.filter((c) => c.count > 0).length,
    [cells]
  );

  const handleCellHover = (cell: DayCell | null, event?: React.MouseEvent) => {
    setHoveredCell(cell);
    if (cell && event) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/60 bg-white p-5 dark:border-zinc-800/40 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            نشاط المهام
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            آخر 365 يوم
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span>
            <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
              {totalTasks}
            </span>{' '}
            مهمة
          </span>
          <span className="h-3 w-px bg-zinc-200 dark:bg-zinc-700" />
          <span>
            <span className="font-extrabold text-zinc-700 dark:text-zinc-300">
              {activeDays}
            </span>{' '}
            يوم نشط
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="flex gap-3" style={{ direction: 'rtl' }}>
          <div
            className="flex flex-col justify-between pt-6 text-[10px] text-zinc-400 dark:text-zinc-500"
            style={{ height: `${SQUARE_SIZE * DAYS + SQUARE_GAP * (DAYS - 1)}px` }}
          >
            {DAY_LABELS_AR.map((label, i) => {
              if (i % 2 !== 0 && i !== 6) return <div key={i} />;
              return (
                <div key={i} style={{ height: `${SQUARE_SIZE}px`, lineHeight: `${SQUARE_SIZE}px` }}>
                  {label.charAt(0)}
                </div>
              );
            })}
          </div>

          <div className="flex-1">
            <div
              className="mb-2 flex"
              style={{
                height: '16px',
                gap: `${SQUARE_GAP}px`,
                paddingRight: '0px',
              }}
            >
              {Array.from({ length: WEEKS }).map((_, weekIdx) => {
                const label = monthLabels.find((m) => m.weekIndex === weekIdx);
                return (
                  <div
                    key={weekIdx}
                    style={{
                      width: `${SQUARE_SIZE}px`,
                      flexShrink: 0,
                    }}
                    className="text-[10px] text-zinc-500 dark:text-zinc-400"
                  >
                    {label?.name || ''}
                  </div>
                );
              })}
            </div>

            <div
              className="grid"
              style={{
                gridTemplateRows: `repeat(${DAYS}, ${SQUARE_SIZE}px)`,
                gridTemplateColumns: `repeat(${WEEKS}, ${SQUARE_SIZE}px)`,
                gap: `${SQUARE_GAP}px`,
                direction: 'rtl',
              }}
            >
              {grid.map((week, weekIdx) =>
                week.map((cell, dayIdx) => {
                  if (!cell) return <div key={`${weekIdx}-${dayIdx}`} />;
                  const color = isDarkMode ? getDarkColor(cell.count) : getColor(cell.count);
                  const isToday =
                    cell.dateStr === new Date().toISOString().split('T')[0];
                  return (
                    <div
                      key={cell.dateStr}
                      onMouseEnter={(e) => handleCellHover(cell, e)}
                      onMouseLeave={() => handleCellHover(null)}
                      onFocus={() => handleCellHover(cell)}
                      onBlur={() => handleCellHover(null)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${formatArabicDate(cell.date)}, ${formatTooltipTasks(cell.count)}`}
                      className={cn(
                        'cursor-pointer transition-transform duration-150 hover:scale-125 hover:z-10 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1',
                        isToday && 'ring-2 ring-emerald-500 ring-offset-1'
                      )}
                      style={{
                        width: `${SQUARE_SIZE}px`,
                        height: `${SQUARE_SIZE}px`,
                        backgroundColor: color,
                        borderRadius: '2px',
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {hoveredCell && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none fixed z-50 rounded-lg border border-zinc-200 bg-zinc-900 px-3 py-2 text-xs text-white shadow-lg dark:border-zinc-700"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <div className="font-medium">{formatArabicDate(hoveredCell.date)}</div>
              <div className="text-zinc-400">{formatTooltipTasks(hoveredCell.count)}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-end gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        <span>أقل</span>
        <div className="flex items-center gap-1">
          {[0, 1, 3, 5, 7].map((count) => (
            <div
              key={count}
              className="rounded-sm"
              style={{
                width: `${SQUARE_SIZE}px`,
                height: `${SQUARE_SIZE}px`,
                backgroundColor: isDarkMode ? getDarkColor(count) : getColor(count),
              }}
            />
          ))}
        </div>
        <span>أكثر</span>
      </div>
    </div>
  );
}
