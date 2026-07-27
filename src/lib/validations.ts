import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يكون 2 أحرف على الأقل' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }),
});

export const registerFormSchema = registerSchema.extend({
  confirmPassword: z.string().min(1, { message: 'تأكيد كلمة المرور مطلوب' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
});

export const taskSchema = z.object({
  title: z.string().min(1, { message: 'العنوان مطلوب' }),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  projectId: z.string().optional(),
  completed: z.boolean().optional(),
  important: z.boolean().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1, { message: 'العنوان مطلوب' }),
  description: z.string().optional(),
  color: z.string().optional(),
  status: z.string().optional(),
});

export const habitSchema = z.object({
  title: z.string().min(1, { message: 'العنوان مطلوب' }),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const settingSchema = z.object({
  theme: z.enum(['light', 'dark', 'auto']).optional(),
  language: z.string().optional(),
  notifications: z.boolean().optional(),
});
