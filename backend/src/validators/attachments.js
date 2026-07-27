// ─── Attachment Validation Schemas ─────────────────────────

const { z } = require('zod');

const taskIdParamSchema = z.object({
  taskId: z.string().uuid('Invalid task ID'),
});

const attachmentIdSchema = z.object({
  id: z.string().uuid('Invalid attachment ID'),
});

module.exports = {
  taskIdParamSchema,
  attachmentIdSchema,
};
