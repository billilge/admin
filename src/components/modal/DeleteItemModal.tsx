'use client';

import { DeleteItemModalProps } from '@/types/modal';

export default function DeleteItemModal({
  isOpen,
  onClose,
  onDelete,
  itemName,
  hasRentedItems,
}: DeleteItemModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4">
          <h2 className="text-xl font-bold text-[#191f28]">물품 삭제</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968] cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-[#4e5968]">
            정말로 <span className="font-medium text-[#191f28]">{itemName}</span>을(를)
            삭제하시겠습니까?
          </p>
          {hasRentedItems && (
            <p className="mt-2 text-sm text-[#e93c3c]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1 inline-block h-4 w-4"
              >
                <path d="M10.29 3.86L1.82 15a2 2 0 0 0 0 3.41l6.57 12.14c.57 1.04 1.66 1.66 2.83 1.66h0a2 2 0 0 0 2-1.66l7.23-13.24a2 2 0 0 0 0-3.41L13.71 3.86c-.57-1.04-1.66-1.66-2.83-1.66h0a2 2 0 0 0-2 1.66z"></path>
                <line x1="8" y1="11" x2="16" y2="11"></line>
                <line x1="8" y1="15" x2="16" y2="15"></line>
              </svg>
              해당 물품은 현재 대여 중인 항목이 있습니다.
            </p>
          )}
          <p className="mt-2 text-sm text-[#4e5968]">삭제 후에는 복구할 수 없습니다.</p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[#e5e8eb] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] focus:outline-none focus:ring-2 focus:ring-[#d1d6db] focus:ring-offset-2 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onDelete}
            className="rounded-md bg-[#e93c3c] px-4 py-2 text-sm font-medium text-white hover:bg-[#c42b2b] focus:outline-none focus:ring-2 focus:ring-[#e93c3c] focus:ring-offset-2 cursor-pointer"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
