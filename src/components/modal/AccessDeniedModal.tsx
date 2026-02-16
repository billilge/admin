'use client';

import { ShieldX } from 'lucide-react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessDeniedModal({ isOpen, onClose }: AccessDeniedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-[var(--popover)] shadow-xl">
        <div className="flex flex-col items-center px-6 py-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--error-bg)]">
            <ShieldX className="h-7 w-7 text-[var(--error)]" />
          </div>
          <h2 className="mb-2 text-lg font-bold text-[var(--foreground)]">접근 권한 없음</h2>
          <p className="text-center text-sm text-[var(--foreground-muted)]">
            해당 페이지에 접근할 권한이 없습니다.
            <br />
            관리자에게 문의해 주세요.
          </p>
        </div>
        <div className="border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
