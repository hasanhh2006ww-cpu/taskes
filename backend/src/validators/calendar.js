// ─── Calendar Validation Schemas ───────────────────────────

const { z } = require('zod');

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500).trim(),
  description: z.string().max(5000).optional().nullable(),
  date: z.string().datetime('Invalid date format'),
  startTime: z.string().datetime().optional().nullable(),
  endTime: z.string().datetime().optional().nullable(),
  allDay: z.boolean().optional().default(false),
  type: z.enum(['TASK', 'HABIT', 'REMINDER', 'DEADLINE', 'CUSTOM']).optional().default('CUSTOM'),
  taskId: z.string().uuid().optional().nullable(),
  habitId: z.string().uuid().optional().nullable(),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(5000).optional().nullable(),
  date: z.string().datetime().optional(),
  startTime: z.string().datetime().optional().nullable(),
  endTime: z.string().datetime().optional().nullable(),
  allDay: z.boolean().optional(),
  type: z.enum(['TASK', 'HABIT', 'REMINDER', 'DEADLINE', 'CUSTOM']).optional(),
});

const eventIdSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
});

const eventQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  type: z.enum(['TASK', 'HABIT', 'REMINDER', 'DEADLINE', 'CUSTOM']).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});

module.exports = {
  createEventSchema,
  updateEventSchema,
  eventIdSchema,
  eventQuerySchema,
};
