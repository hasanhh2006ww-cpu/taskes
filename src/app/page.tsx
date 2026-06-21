'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/logger';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    logger.info('Root route accessed, redirecting to /dashboard');
    router.replace('/dashboard');
  }, [router]);

  return null;
}
