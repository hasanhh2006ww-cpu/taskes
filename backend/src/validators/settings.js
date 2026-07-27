// ─── Settings Validation Schemas ───────────────────────────

const { z } = require('zod');

const updateSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  timezone: z.string().max(100).optional(),
  language: z.enum(['ar', 'en']).optional(),
  notificationEmail: z.boolean().optional(),
  notificationPush: z.boolean().optional(),
  workMinutes: z.number().int().min(1).max(120).optional(),
  breakMinutes: z.number().int().min(1).max(60).optional(),
  longBreakMinutes: z.number().int().min(1).max(60).optional(),
  sessionsBeforeLongBreak: z.number().int().min(1).max(10).optional(),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

module.exports = {
  updateSettingsSchema,
  updateProfileSchema,
  changePasswordSchema,
};
