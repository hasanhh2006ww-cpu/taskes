"use client";

import Link from "next/link";
import { motion } from 'framer-motion';
import { SettingsView } from '@/components/settings/SettingsView';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

const tabs = [
  { href: '/settings', label: 'عام', currentPath: '/settings' },
  { href: '/settings/account', label: 'الحساب', currentPath: '/settings/account' },
];

export default function SettingsPage() {
  const pathname = usePathname();
  const isAccount = pathname === '/settings/account';

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="flex h-full flex-1 flex-col overflow-hidden bg-zinc-50 dark:bg-[#0A0E17]">
      <div className="flex items-center gap-4 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">
          {isAccount ? 'إعدادات الحساب' : 'الإعدادات'}
        </h1>
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                pathname === tab.currentPath
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SettingsView />
      </div>
    </motion.div>
  );
}
