'use server';

import { hash, compare } from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { encode } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { registerFormSchema, loginSchema } from '@/lib/validations';
import { DEMO_EMAIL, DEMO_PASSWORD } from '@/lib/constants';
import { signOut } from '@/lib/auth';

const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

async function createSessionCookie(user: { id: string; name: string | null; email: string; avatar: string | null; isDemo: boolean }) {
  const token = await encode({
    secret: process.env.NEXTAUTH_SECRET!,
    salt: 'authjs.session-token',
    token: {
      id: user.id,
      name: user.name,
      email: user.email,
      picture: user.avatar,
      isDemo: user.isDemo,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('authjs.session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'بيانات غير صالحة';
    redirect(`/login?error=${encodeURIComponent(firstError)}`);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    redirect('/login?error=البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    redirect('/login?error=البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  await createSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isDemo: user.isDemo,
  });

  redirect('/dashboard');
}

export async function registerAction(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const parsed = registerFormSchema.safeParse(rawData);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || 'بيانات غير صالحة';
    redirect(`/register?error=${encodeURIComponent(firstError)}`);
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect('/register?error=البريد الإلكتروني مستخدم بالفعل');
  }

  const hashed = await hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      settings: { create: {} },
    },
  });

  await createSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: null,
    isDemo: false,
  });

  redirect('/dashboard');
}

export async function demoLoginAction() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });

  let user = existing;

  if (!user) {
    const hashed = await hash(DEMO_PASSWORD, 12);
    user = await prisma.user.create({
      data: {
        name: 'Demo User',
        email: DEMO_EMAIL,
        password: hashed,
        isDemo: true,
        settings: { create: {} },
      },
    });
  } else if (!user.isDemo) {
    user = await prisma.user.update({
      where: { email: DEMO_EMAIL },
      data: { isDemo: true },
    });
  }

  await createSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    isDemo: user.isDemo,
  });

  redirect('/dashboard');
}

export async function logoutAction() {
  await signOut({ redirectTo: '/login' });
}
