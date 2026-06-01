import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type { Project } from '@/lib/types';
import { loadFromStorage, saveToStorage } from '@/lib/storage';
import { STORAGE_KEYS, PROJECT_COLORS } from '@/lib/constants';

interface ProjectState {
  projects: Project[];
  addProject: (name: string) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

const initialProjects = loadFromStorage<Project[]>(STORAGE_KEYS.PROJECTS, []);

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: initialProjects,

  addProject: (name) => {
    const colorIndex = get().projects.length % PROJECT_COLORS.length;
    const project: Project = {
      id: uuid(),
      name,
      color: PROJECT_COLORS[colorIndex],
      createdAt: Date.now(),
    };
    const updated = [...get().projects, project];
    set({ projects: updated });
    saveToStorage(STORAGE_KEYS.PROJECTS, updated);
  },

  updateProject: (id, updates) => {
    const projects = get().projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    set({ projects });
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
  },

  deleteProject: (id) => {
    const projects = get().projects.filter((p) => p.id !== id);
    set({ projects });
    saveToStorage(STORAGE_KEYS.PROJECTS, projects);
  },
}));
