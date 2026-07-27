// ─── Task Validation Schemas ───────────────────────────────

const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500).trim(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional().default('MEDIUM'),
  category: z.enum(['TASK', 'MEETING', 'FOCUS', 'PROJECT', 'CANCELLED']).optional().default('TASK'),
  dueDate: z.string().datetime().optional().nullable(),
  important: z.boolean().optional().default(false),
  isRepeating: z.boolean().optional().default(false),
  repeatPattern: z.string().max(50).optional().nullable(),
  reminderAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  estimatedTime: z.number().int().positive().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.enum(['TASK', 'MEETING', 'FOCUS', 'PROJECT', 'CANCELLED']).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  completed: z.boolean().optional(),
  important: z.boolean().optional(),
  archived: z.boolean().optional(),
  isRepeating: z.boolean().optional(),
  repeatPattern: z.string().max(50).optional().nullable(),
  reminderAt: z.string().datetime().optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
  estimatedTime: z.number().int().positive().optional().nullable(),
  actualTime: z.number().int().positive().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  order: z.number().int().min(0).optional(),
});

const taskIdSchema = z.object({
  id: z.string().uuid('Invalid task ID'),
});

const createSubTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500).trim(),
});

const updateSubTaskSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  completed: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

const taskQuerySchema = z.object({
  filter: z.enum(['all', 'today', 'upcoming', 'completed', 'archived']).optional().default('all'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.enum(['TASK', 'MEETING', 'FOCUS', 'PROJECT', 'CANCELLED']).optional(),
  projectId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

const createTaskLabelSchema = z.object({
  name: z.string().min(1, 'Label name is required').max(100).trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional().default('#6366f1'),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  createSubTaskSchema,
  updateSubTaskSchema,
  taskQuerySchema,
  createTaskLabelSchema,
};
