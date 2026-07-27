'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Info, X } from 'lucide-react';
import { useState } from 'react';

export function DemoBanner() {
  const { data: session } = useSession();
  const isDemo = session?.user?.isDemo === true;
  const [dismissed, setDismissed] = useState(false);

  if (!isDemo || dismissed) return null;

  return (
    <div className="flex items-center gap-3 bg-amber-50/90 border-b border-amber-200/60 px-4 py-2.5 backdrop-blur-sm dark:bg-amber-950/30 dark:border-amber-800/30">
      <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="flex-1 text-sm text-amber-700 dark:text-amber-300">
        أنت تستخدم النسخة التجريبية من Stilldo. بعض الميزات معطلة.
      </p>
      <Link
        href="/register"
        className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
      >
        إنشاء حساب
      </Link>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-lg p-1 text-amber-600 transition-colors hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/50"
        aria-label="إغلاق"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
