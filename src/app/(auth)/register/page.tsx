import Link from 'next/link';
import { Suspense } from 'react';
import { registerAction } from '@/lib/actions/auth';
import { RegisterError } from './RegisterError';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 dark:from-[#0A0E17] dark:via-[#111827] dark:to-[#020617]">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/60 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-800/50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">إنشاء حساب</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">أنشئ حسابك لبدء تنظيم مهامك</p>
        </div>

        <Suspense>
          <RegisterError />
        </Suspense>

        <form action={registerAction} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">الاسم</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
              dir="auto"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">البريد الإلكتروني</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
              dir="auto"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">كلمة المرور</label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">تأكيد كلمة المرور</label>
            <input
              name="confirmPassword"
              type="password"
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            إنشاء حساب
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="font-medium text-emerald-500 hover:text-emerald-600">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  );
}
