// ─── Habit Validation Schemas ──────────────────────────────

const { z } = require('zod');

const createHabitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).trim(),
  description: z.string().max(5000).optional().nullable(),
  type: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  icon: z.string().max(100).optional().default('Flame'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional().default('#f59e0b'),
  frequency: z.number().int().min(1).max(7).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  period: z.enum(['START', 'MIDDLE', 'END']).optional(),
  targetCount: z.number().int().min(1).max(31).optional(),
});

const updateHabitSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  icon: z.string().max(100).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional(),
  frequency: z.number().int().min(1).max(7).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  period: z.enum(['START', 'MIDDLE', 'END']).optional(),
  targetCount: z.number().int().min(1).max(31).optional(),
  isActive: z.boolean().optional(),
});

const habitIdSchema = z.object({
  id: z.string().uuid('Invalid habit ID'),
});

const habitLogSchema = z.object({
  date: z.string().datetime('Invalid date format'),
  completed: z.boolean().optional().default(true),
});

module.exports = {
  createHabitSchema,
  updateHabitSchema,
  habitIdSchema,
  habitLogSchema,
};
