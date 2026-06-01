import type { Priority } from './types';

export const PRIORITIES: { label: string; value: Priority; color: string }[] = [
  { label: 'منخفض', value: 'low', color: 'bg-blue-400/20 text-blue-400' },
  { label: 'متوسط', value: 'medium', color: 'bg-amber-400/20 text-amber-400' },
  { label: 'عالي', value: 'high', color: 'bg-rose-400/20 text-rose-400' },
];

export const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

export const STORAGE_KEYS = {
  TASKS: 'my-taske-tasks',
  PROJECTS: 'my-taske-projects',
  UI: 'my-taske-ui',
} as const;

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}
