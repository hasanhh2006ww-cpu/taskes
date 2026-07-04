import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Task, TaskCategory, SubTask, ActivityLogEntry, FilterType, Priority } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS, getToday } from '@/lib/constants';
import { logger } from '@/lib/logger';

interface TaskState {
  tasks: Task[];
  filter: FilterType;
  activeProjectId: string | null;
  activeTaskId: string | null;
  expandedTasks: Record<string, boolean>;
  setFilter: (filter: FilterType) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveTaskId: (id: string | null) => void;
  addTask: (task: { title: string; priority?: Priority; category?: string; projectId?: string; dueDate?: string }) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleImportant: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  setTasks: (tasks: Task[]) => void;
  incrementPomodoro: (id: string) => void;
  getFilteredTasks: () => Task[];
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  updateSubtask: (taskId: string, subtaskId: string, title: string) => void;
  reorderSubtasks: (taskId: string, fromIndex: number, toIndex: number) => void;
  addActivityLog: (taskId: string, type: string, message: string) => void;
  addFocusSession: (taskId: string, durationMinutes: number) => void;
  toggleTaskExpanded: (id: string) => void;
  rehydrate: () => void;
}

const initialTasks: Task[] = [];
const initialExpanded: Record<string, boolean> = {};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: initialTasks,
  filter: 'all',
  activeProjectId: null,
  activeTaskId: null,
  expandedTasks: initialExpanded,

  setFilter: (filter) => set({ filter, activeProjectId: null }),

  setActiveProjectId: (id) => set({ activeProjectId: id, filter: 'all' }),

  setActiveTaskId: (id) => set({ activeTaskId: id }),

  addTask: ({ title, priority = 'medium', category, projectId, dueDate }) => {
    const { tasks, activeProjectId } = get();
    const newTask: Task = {
      id: uuid(),
      title,
      priority,
      category: category as TaskCategory | undefined,
      projectId: projectId ?? activeProjectId ?? undefined,
      dueDate,
      completed: false,
      important: false,
      createdAt: Date.now(),
      order: tasks.length,
      pomodoroCount: 0,
      subtasks: [],
      activityLog: [],
      focusSessions: 0,
      totalFocusTime: 0,
    };
    const updated = [...tasks, newTask];
    set({ tasks: updated });
    saveToStorage(STORAGE_KEYS.TASKS, updated);
    return newTask.id;
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

  addSubtask: (taskId, title) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const subs = (t as any).subtasks || [];
      const newSub: SubTask = { id: uuid(), title, completed: false, order: subs.length };
      return { ...t, subtasks: [...subs, newSub] };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  toggleSubtask: (taskId, subtaskId) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const subs = ((t as any).subtasks || []).map((s: SubTask) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      );
      return { ...t, subtasks: subs };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  deleteSubtask: (taskId, subtaskId) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      return { ...t, subtasks: ((t as any).subtasks || []).filter((s: SubTask) => s.id !== subtaskId) };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  updateSubtask: (taskId, subtaskId, title) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const subs = ((t as any).subtasks || []).map((s: SubTask) =>
        s.id === subtaskId ? { ...s, title } : s
      );
      return { ...t, subtasks: subs };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  reorderSubtasks: (taskId, fromIndex, toIndex) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const subs = [...((t as any).subtasks || [])];
      const [moved] = subs.splice(fromIndex, 1);
      subs.splice(toIndex, 0, moved);
      return { ...t, subtasks: subs.map((s: SubTask, i: number) => ({ ...s, order: i })) };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  addActivityLog: (taskId, type, message) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      const entry: ActivityLogEntry = { id: uuid(), type, message, timestamp: Date.now() };
      const logs = [...((t as any).activityLog || []), entry];
      return { ...t, activityLog: logs };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  addFocusSession: (taskId, durationMinutes) => {
    const tasks = get().tasks.map((t) => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        focusSessions: ((t as any).focusSessions || 0) + 1,
        totalFocusTime: ((t as any).totalFocusTime || 0) + durationMinutes,
      };
    });
    set({ tasks });
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
  },

  toggleTaskExpanded: (id) => {
    const expandedTasks = { ...get().expandedTasks };
    const newState = !expandedTasks[id];
    expandedTasks[id] = newState;
    set({ expandedTasks });
    saveToStorage(STORAGE_KEYS.EXPANDED_TASKS, expandedTasks);
    logger.info(`Task expanded ${newState ? 'open' : 'close'}`, { taskId: id });
  },

  rehydrate: () => {
    const tasks = loadFromStorage<Task[]>(STORAGE_KEYS.TASKS, []);
    const expandedTasks = loadFromStorage<Record<string, boolean> | null>(STORAGE_KEYS.EXPANDED_TASKS, {}) ?? {};
    set({ tasks, expandedTasks });
  },
}));
