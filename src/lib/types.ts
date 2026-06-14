export type Priority = 'low' | 'medium' | 'high';

export type FilterType = 'all' | 'today' | 'important' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate?: string;
  completed: boolean;
  projectId?: string;
  createdAt: number;
  order: number;
  important: boolean;
  pomodoroCount: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Habit {
  id: string;
  title: string;
  createdAt: number;
  order: number;
  completions: Record<string, boolean>;
  streak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}
