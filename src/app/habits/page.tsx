'use client';

import { motion } from 'framer-motion';
import { HabitTrackerPro } from '@/components/habits/HabitTrackerPro';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

export default function HabitsPage() {
  return (
    <motion.div {...pageVariants} className="flex flex-1 overflow-hidden">
      <HabitTrackerPro />
    </motion.div>
  );
}
