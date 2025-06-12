'use client';

import { X, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState, useEffect } from 'react';
import { AddPayerModalProps } from '@/types/modal';
import { Payer } from '@/types/payer';

export default function AddPayerModal({ isOpen, onClose, onApply }: AddPayerModalProps) {
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [payers, setPayers] = useState<Payer[]>([]);
  const [nextId, setNextId] = useState(2);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setPayers([]);
      setName('');
      setStudentId('');
      setNextId(1);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const addPayer = () => {
    if (name.trim() && studentId.trim()) {
      const formattedStudentId = studentId.startsWith('20') ? studentId : `20${studentId}`;

      setPayers([...payers, { id: nextId, name, studentId: formattedStudentId }]);
      setNextId(nextId + 1);
      setName('');
      setStudentId('');
    }
  };

  const removePayer = (id: number) => {
    setPayers(payers.filter((payer) => payer.id !== id));
  };

  const handleApply = () => {
    onApply(payers);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addPayer();
    }
  };

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.startsWith('20')) {
      setStudentId(value.substring(2));
    } else {
      setStudentId(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)]"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-center justify-between border-b border-[#e5e8eb] px-6 py-4">
          <h2 className="text-xl font-bold text-[#191f28]">학생회비 납부자 추가하기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-[#e5e8eb] px-6 py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-[#191f28]">
                20
              </div>
              <input
                type="text"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="학번"
                className="h-12 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] pl-10 pr-4 text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="relative flex-[2]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요."
                className="h-12 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 pr-12 text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={addPayer}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#8b95a1] hover:bg-[#f2f4f6] hover:text-[#4e5968]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto px-6 py-4">
          <div className="mb-2 grid grid-cols-2 items-center">
            <div className="text-sm font-medium text-[#6b7684]">추가된 이름</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[#6b7684]">추가된 학번</div>
              {payers.length > 0 && (
                <button
                  onClick={() => setPayers([])}
                  className="rounded-md p-1 text-[#8b95a1] hover:bg-[#fff0f1] hover:text-[#e93c3c]"
                  title="모두 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {payers.map((payer) => (
              <div
                key={payer.id}
                className="group relative grid grid-cols-2 items-center rounded-md border border-[#e5e8eb] px-4 py-3 hover:border-[#d1d6db]"
              >
                <div className="text-sm text-[#191f28]">{payer.name}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#6b7684]">{payer.studentId}</div>
                  <button
                    onClick={() => removePayer(payer.id)}
                    className="rounded-md p-1 text-[#8b95a1] opacity-0 transition-opacity hover:bg-[#fff0f1] hover:text-[#e93c3c] group-hover:opacity-100"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {payers.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-[#e5e8eb] text-sm text-[#8b95a1]">
                추가된 납부자가 없습니다
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[#e5e8eb] px-6 py-4">
          <button
            onClick={handleApply}
            className="h-12 w-full rounded-md bg-[#004A98] text-base font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
