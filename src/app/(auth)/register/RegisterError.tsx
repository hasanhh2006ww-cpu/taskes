'use client';

import { useSearchParams } from 'next/navigation';

export function RegisterError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  return (
    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
      {error}
    </div>
  );
}
