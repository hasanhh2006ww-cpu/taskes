import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Task, FilterType, Priority } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS, getToday } from '@/lib/constants';

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  activeProjectId: string | null;
  activeTaskId: string | null;
  setFilter: (filter: FilterType) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveTaskId: (id: string | null) => void;
  addTask: (task: { title: string; priority?: Priority; projectId?: string; dueDate?: string }) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleImportant: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  setTasks: (tasks: Task[]) => void;
  incrementPomodoro: (id: string) => void;
  getFilteredTasks: () => Task[];
}

const initialTasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: initialTasks,
  filter: 'all',
  activeProjectId: null,
  activeTaskId: null,

  setFilter: (filter) => set({ filter, activeProjectId: null }),

  setActiveProjectId: (id) => set({ activeProjectId: id, filter: 'all' }),

  setActiveTaskId: (id) => set({ activeTaskId: id }),

  addTask: ({ title, priority = 'medium', projectId, dueDate }) => {
    const { tasks, activeProjectId } = get();
    const newTask: Task = {
      id: uuid(),
      title,
      priority,
      projectId: projectId ?? activeProjectId ?? undefined,
      dueDate,
      completed: false,
      important: false,
      createdAt: Date.now(),
      order: tasks.length,
      pomodoroCount: 0,
    };
    const updated = [...tasks, newTask];
    set({ tasks: updated, activeTaskId: newTask.id });
    saveToStorage(STORAGE_KEYS.TASKS, updated);
  },

  updateTask: (id, updates) => {
    const tasks = get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter((t) => t.id !== id);
    set({ tasks, activeTaskId: null });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  toggleComplete: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  toggleImportant: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, important: !t.important } : t
    );
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  reorderTasks: (fromIndex, toIndex) => {
    const tasks = [...get().tasks];
    const [moved] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, moved);
    const reordered = tasks.map((t, i) => ({ ...t, order: i }));
    set({ tasks: reordered });
    saveToStorage(STORAGE_KEYS.TASKS, reordered);
  },

  setTasks: (tasks) => {
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  incrementPomodoro: (id) => {
    const tasks = get().tasks.map((t) =>
      t.id === id ? { ...t, pomodoroCount: t.pomodoroCount + 1 } : t
    );
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  getFilteredTasks: () => {
    const { tasks, filter, activeProjectId } = get();
    let filtered = [...tasks].sort((a, b) => a.order - b.order);

    if (activeProjectId) {
      filtered = filtered.filter((t) => t.projectId === activeProjectId);
    }

    switch (filter) {
      case 'today':
        filtered = filtered.filter((t) => t.dueDate === getToday());
        break;
      case 'important':
        filtered = filtered.filter((t) => t.important);
        break;
      case 'completed':
        filtered = filtered.filter((t) => t.completed);
        break;
    }

    return filtered;
  },
}));
