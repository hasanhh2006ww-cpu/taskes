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
