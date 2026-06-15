'use client';

import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'نعم',
  cancelLabel = 'إلغاء',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 sm:rounded-2xl sm:mx-4">
        <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1">{cancelLabel}</Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            className="flex-1 bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-500 dark:hover:bg-rose-600"
          >{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
