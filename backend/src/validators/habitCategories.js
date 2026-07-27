// ─── HabitCategory Validation Schemas ──────────────────────

const { z } = require('zod');

const createHabitCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(255).trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional().default('#f59e0b'),
  icon: z.string().max(100).optional().nullable(),
});

const updateHabitCategorySchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(100).optional().nullable(),
});

const habitCategoryIdSchema = z.object({
  id: z.string().uuid('Invalid category ID'),
});

module.exports = {
  createHabitCategorySchema,
  updateHabitCategorySchema,
  habitCategoryIdSchema,
};
