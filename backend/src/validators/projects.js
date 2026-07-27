// ─── Project Validation Schemas ────────────────────────────

const { z } = require('zod');

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255).trim(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional().default('#6366f1'),
  icon: z.string().max(100).optional().nullable(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).trim().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color format').optional(),
  icon: z.string().max(100).optional().nullable(),
  isActive: z.boolean().optional(),
});

const projectIdSchema = z.object({
  id: z.string().uuid('Invalid project ID'),
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
};
