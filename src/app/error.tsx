'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-rose-500">حدث خطأ</h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
          تعذر تحميل الصفحة. حاول مرة أخرى.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-indigo-500 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
