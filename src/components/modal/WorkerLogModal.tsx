'use client';

import { X, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useGetWorkerLogs } from '@/api-client';
import type { RentalStatusWorkerLogDetailRentalStatus } from '@/api-client/model';

const statusLabelMap: Record<RentalStatusWorkerLogDetailRentalStatus, string> = {
  PENDING: '승인 대기 중',
  CANCEL: '취소됨',
  CONFIRMED: '승인 완료',
  REJECTED: '승인 거절',
  RENTAL: '대여 중',
  RETURN_PENDING: '반납 대기 중',
  RETURN_CONFIRMED: '반납 승인 완료',
  RETURNED: '반납 완료',
};

const statusColorMap: Record<RentalStatusWorkerLogDetailRentalStatus, string> = {
  PENDING: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  CANCEL: 'bg-[var(--secondary)] text-[var(--foreground-subtle)]',
  CONFIRMED: 'bg-[var(--success-bg)] text-[var(--success)]',
  REJECTED: 'bg-[var(--error-bg)] text-[var(--error)]',
  RENTAL: 'bg-[var(--info-bg)] text-[var(--info)]',
  RETURN_PENDING: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  RETURN_CONFIRMED: 'bg-[var(--success-bg)] text-[var(--success)]',
  RETURNED: 'bg-[var(--success-bg)] text-[var(--success)]',
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

interface WorkerLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  rentalHistoryId: number;
}

export default function WorkerLogModal({ isOpen, onClose, rentalHistoryId }: WorkerLogModalProps) {
  const { data, isLoading } = useGetWorkerLogs(rentalHistoryId, {
    query: { enabled: isOpen },
  });

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

  const workers = data?.workers ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-lg bg-[var(--popover)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">근무자 기록</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-[var(--foreground-subtle)]" />
            </div>
          ) : workers.length === 0 ? (
            <div className="py-12 text-center text-sm text-[var(--foreground-subtle)]">
              근무자 기록이 없습니다.
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--foreground-muted)]">
                    상태
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--foreground-muted)]">
                    처리자
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--foreground-muted)]">
                    처리 시각
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {workers.map((log, index) => (
                  <tr key={index}>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColorMap[log.rentalStatus]}`}
                      >
                        {statusLabelMap[log.rentalStatus]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-sm text-[var(--foreground)]">
                      {log.worker ? (
                        <span>
                          {log.worker.name}{' '}
                          <span className="text-[var(--foreground-subtle)]">
                            ({log.worker.studentId})
                          </span>
                        </span>
                      ) : (
                        <span className="text-[var(--foreground-subtle)]">시스템</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-sm text-[var(--foreground-muted)]">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
