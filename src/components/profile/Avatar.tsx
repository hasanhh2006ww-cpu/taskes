'use client';

import { useSession } from 'next-auth/react';
import { getInitials } from '@/lib/utils';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showName?: boolean;
}

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

export function Avatar({ size = 'md', className = '', showName = false }: AvatarProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = getInitials(user?.name ?? '');
  const avatarUrl = user?.image;

  return (
    <div className={`relative shrink-0 ${SIZE_CLASSES[size]} ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.name ?? 'avatar'}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 font-bold dark:bg-emerald-500/20 dark:text-emerald-400">
          {initials}
        </div>
      )}
    </div>
  );
}
