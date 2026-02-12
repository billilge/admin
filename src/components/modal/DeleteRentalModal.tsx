'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { DeleteRentalModalProps } from '@/types/modal';

export default function DeleteRentalModal({
  isOpen,
  onClose,
  onDelete,
  rentalInfo,
  isActive,
}: DeleteRentalModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-[var(--popover)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">대여 기록 삭제</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-4 flex items-center justify-center">
            {isActive ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--error-bg)]">
                <AlertTriangle className="h-6 w-6 text-[var(--error)]" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--secondary)]">
                <X className="h-6 w-6 text-[var(--foreground-muted)]" />
              </div>
            )}
          </div>

          <div className="mb-6 text-center">
            <p className="text-base text-[var(--foreground)]">
              <span className="font-medium">{rentalInfo}</span>을(를) 삭제할까요?
            </p>
            {isActive && (
              <p className="mt-2 text-sm text-[var(--error)]">
                현재 대여 중인 기록입니다. 삭제하면 물품 관리에 영향을 줄 수 있습니다.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--card)] py-3 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]"
            >
              취소
            </button>
            <button
              onClick={onDelete}
              className="flex-1 rounded-lg bg-[var(--error)] py-3 text-sm font-medium text-white hover:opacity-90"
            >
              삭제할래요
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
