import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-500">404</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          الصفحة غير موجودة
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-indigo-500 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
          aria-label="العودة إلى الرئيسية"
        >
          العودة إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
