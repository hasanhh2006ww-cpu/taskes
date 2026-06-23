'use client';

import { motion } from 'framer-motion';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useEffect } from 'react';
import supabase from '@/lib/supabase';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

export default function DashboardPage() {
  useEffect(() => {
    const sb = supabase;
    if (!sb) return;
    const checkSupabaseConnection = async () => {
      try {
        const { error } = await sb.from('tasks').select('id').limit(1);
        if (error && error.code !== '42P01') {
          console.error('Supabase connection error:', error.message);
        }
      } catch (err) {
        console.error('Supabase unexpected error:', err);
      }
    };
    checkSupabaseConnection();
  }, []);

  return (
    <motion.div {...pageVariants} className="flex w-full flex-1 overflow-hidden">
      <Dashboard />
    </motion.div>
  );
}
