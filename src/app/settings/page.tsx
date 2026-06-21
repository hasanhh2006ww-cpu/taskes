'use client';

import { motion } from 'framer-motion';
import { SettingsView } from '@/components/settings/SettingsView';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
};

export default function SettingsPage() {
  return (
    <motion.div {...pageVariants} className="flex w-full flex-1 overflow-hidden">
      <SettingsView />
    </motion.div>
  );
}
