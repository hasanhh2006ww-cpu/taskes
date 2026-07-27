// ─── Focus / Pomodoro Validation Schemas ───────────────────

const { z } = require('zod');

const createPomodoroSchema = z.object({
  duration: z.number().int().min(1, 'Duration must be at least 1 minute').max(180, 'Duration cannot exceed 180 minutes'),
  breakDuration: z.number().int().min(1).max(60).optional().default(5),
  taskId: z.string().uuid().optional().nullable(),
});

const completePomodoroSchema = z.object({
  interrupted: z.boolean().optional().default(false),
});

const focusQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

module.exports = {
  createPomodoroSchema,
  completePomodoroSchema,
  focusQuerySchema,
};
