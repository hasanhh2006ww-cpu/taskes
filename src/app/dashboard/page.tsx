'use client';

import { motion } from 'framer-motion';
import { Dashboard } from '@/components/dashboard/Dashboard';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

export default function DashboardPage() {
  return (
    <motion.div {...pageVariants} className="flex flex-1 overflow-hidden">
      <Dashboard />
    </motion.div>
  );
}
