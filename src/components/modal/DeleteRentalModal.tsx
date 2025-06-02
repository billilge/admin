'use client';

import { X, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

interface DeleteRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  rentalInfo: string;
  isActive: boolean;
}

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
      <div className="w-full max-w-md overflow-hidden rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4">
          <h2 className="text-xl font-bold text-[#191f28]">대여 기록 삭제</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-4 flex items-center justify-center">
            {isActive ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f1]">
                <AlertTriangle className="h-6 w-6 text-[#e93c3c]" />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f4f6]">
                <X className="h-6 w-6 text-[#4e5968]" />
              </div>
            )}
          </div>

          <div className="mb-6 text-center">
            <p className="text-base text-[#191f28]">
              <span className="font-medium">{rentalInfo}</span>을(를) 삭제할까요?
            </p>
            {isActive && (
              <p className="mt-2 text-sm text-[#e93c3c]">
                현재 대여 중인 기록입니다. 삭제하면 물품 관리에 영향을 줄 수 있습니다.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-md border border-[#e5e8eb] bg-white py-3 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6]"
            >
              취소
            </button>
            <button
              onClick={onDelete}
              className="flex-1 rounded-md bg-[#e93c3c] py-3 text-sm font-medium text-white hover:bg-[#d63535]"
            >
              삭제할래요
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
