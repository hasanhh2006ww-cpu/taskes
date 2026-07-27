'use server';

import fs from 'fs';
import path from 'path';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveAvatar, validateAvatar } from '@/lib/upload';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

async function getDemoUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('غير مصرح');
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  return { session: session as { user: { id: string; name?: string | null; email?: string | null; image?: string | null } }, user };
}

const DEMO_BLOCK = 'هذه الميزة غير متاحة في الحساب التجريبي.';

export async function updateProfileName(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('غير مصرح');

  if (!name || name.trim().length < 2) {
    return { error: 'الاسم يجب أن يكون حرفين على الأقل' };
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  });

  revalidatePath('/profile');
  revalidatePath('/settings/account');

  return { success: true, name: user.name };
}

export async function updateProfileEmail(email: string) {
  const { session, user } = await getDemoUser();
  if (user?.isDemo) return { error: DEMO_BLOCK };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && session.user && existing.id !== session.user.id) {
    return { error: 'البريد الإلكتروني مستخدم من قبل مستخدم آخر' };
  }

  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { email: email.toLowerCase().trim() },
  });

  revalidatePath('/profile');
  revalidatePath('/settings/account');

  return { success: true, email: updatedUser.email };
}

export async function uploadAvatarAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('غير مصرح');

  const file = formData.get('avatar') as File;
  if (!file) return { error: 'لم يتم اختيار صورة' };

  try {
    validateAvatar(file);
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'خطأ في الصورة' };
  }

  const url = await saveAvatar(session.user.id, file);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar: url },
  });

  revalidatePath('/profile');
  revalidatePath('/settings/account');

  return { success: true, avatar: url };
}

export async function removeAvatarAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('غير مصرح');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (user?.avatar) {
    const filePath = path.resolve(process.cwd(), 'public', user.avatar);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatar: null },
  });

  revalidatePath('/profile');
  revalidatePath('/settings/account');

  return { success: true };
}

export async function changePasswordAction(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
) {
  const { session, user } = await getDemoUser();
  if (user?.isDemo) return { error: DEMO_BLOCK };

  if (newPassword.length < 8) {
    return { error: 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل' };
  }

  if (newPassword !== confirmPassword) {
    return { error: 'كلمتا المرور غير متطابقتان' };
  }

  if (!user) return { error: 'المستخدم غير موجود' };

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { error: 'كلمة المرور الحالية غير صحيحة' };
  }

  const hashed = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashed },
  });

  return { success: true };
}

export async function debugUserSession() {
  const session = await auth();

  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    return {
      session: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      dbUser: {
        id: dbUser?.id,
        name: dbUser?.name,
        email: dbUser?.email,
        avatar: dbUser?.avatar,
        image: dbUser?.avatar,
      },
    };
  }
  return { session: null, dbUser: null };
}

export async function deleteAccountAction(password: string) {
  const { session, user } = await getDemoUser();
  if (user?.isDemo) return { error: DEMO_BLOCK };

  if (!user) return { error: 'المستخدم غير موجود' };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return { error: 'كلمة المرور غير صحيحة' };
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  return { success: true };
}