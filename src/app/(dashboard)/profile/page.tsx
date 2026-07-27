'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/profile/Avatar';
import { getInitials } from '@/lib/utils';
import { logger } from '@/lib/logger';
import type { ReactNode } from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

interface Stats {
  tasks: number;
  projects: number;
  habits: number;
  focusSessions: number;
}

function StatsGrid({ stats }: { stats: Stats }) {
  const items = [
    { label: 'المهام', icon: '📋', value: stats.tasks },
    { label: 'المشاريع', icon: '📁', value: stats.projects },
    { label: 'العادات', icon: '🔥', value: stats.habits },
    { label: 'جلسات التركيز', icon: '⏱️', value: stats.focusSessions },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((s) => (
        <div
          key={s.label}
          className="rounded-2xl border border-zinc-200/60 bg-white/80 p-4 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60"
        >
          <p className="text-2xl">{s.icon}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {s.value}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ tasks: 0, projects: 0, habits: 0, focusSessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      logger.info('Profile page', { userId: session?.user?.id });
    }
  }, [status, session]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [tasksRes, projectsRes, habitsRes, sessionsRes] = await Promise.all([
          fetch('/api/tasks').then((r) => r.json()),
          fetch('/api/projects').then((r) => r.json()),
          fetch('/api/habits').then((r) => r.json()),
          fetch('/api/focus-sessions').then((r) => r.json()),
        ]);
        setStats({
          tasks: Array.isArray(tasksRes) ? tasksRes.length : 0,
          projects: Array.isArray(projectsRes) ? projectsRes.length : 0,
          habits: Array.isArray(habitsRes) ? habitsRes.length : 0,
          focusSessions: Array.isArray(sessionsRes) ? sessionsRes.length : 0,
        });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    if (status === 'authenticated') fetchStats();
  }, [status]);

  if (status === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.replace('/login');
    return null;
  }

  const user = session?.user;

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="flex h-full flex-1 flex-col overflow-y-auto bg-zinc-50 dark:bg-[#0A0E17]"
    >
      <div className="px-4 pt-5 pb-3 md:px-6">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 md:text-xl">
          الملف الشخصي
        </h1>
      </div>

      <div className="flex-1 px-4 pb-8 md:px-6">
        <div className="mb-6 flex items-center gap-4">
          <Avatar size="xl" />
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {user?.name ?? 'مستخدم'}
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {user?.email ?? ''}
            </p>
            {(session?.user as { createdAt?: string })?.createdAt && (
              <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                عضو منذ{' '}
                {new Date((session?.user as { createdAt?: string }).createdAt as string).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <StatsGrid stats={stats} />
        )}
      </div>
    </motion.div>
  );
}