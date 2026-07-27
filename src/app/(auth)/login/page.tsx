import Link from 'next/link';
import { Suspense } from 'react';
import { loginAction, demoLoginAction } from '@/lib/actions/auth';
import { Rocket } from 'lucide-react';
import { LoginError } from './LoginError';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 dark:from-[#0A0E17] dark:via-[#111827] dark:to-[#020617]">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200/60 bg-white/80 p-8 shadow-lg backdrop-blur-xl dark:border-zinc-700/50 dark:bg-zinc-800/50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">تسجيل الدخول</h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">أهلاً بعودتك! أدخل بياناتك للمتابعة</p>
        </div>

        <Suspense>
          <LoginError />
        </Suspense>

        <form action={loginAction} className="space-y-5">
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 px-4 py-2.5 text-sm text-zinc-800 outline-none transition-colors focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-100 dark:focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full cursor-pointer rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            تسجيل الدخول
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ليس لديك حساب؟{' '}
          <Link href="/register" className="font-medium text-emerald-500 hover:text-emerald-600">
            إنشاء حساب
          </Link>
        </p>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white/80 px-3 text-zinc-400 dark:bg-zinc-800/50 dark:text-zinc-500">أو</span>
          </div>
        </div>

        <form action={demoLoginAction}>
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-100 hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:border-zinc-500"
          >
            <Rocket className="h-4 w-4" />
            تجربة المنصة
          </button>
        </form>
      </div>
    </div>
  );
}
