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
      if (studentId.length !== 8) {
        return;
      }

      setPayers([...payers, { id: nextId, name, studentId }]);
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
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setStudentId(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-lg bg-[var(--popover)] shadow-xl"
        style={{ maxHeight: 'calc(100vh - 40px)' }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">학생회비 납부자 추가하기</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-[var(--border)] px-6 py-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                value={studentId}
                onChange={handleStudentIdChange}
                placeholder="학번 (8자리)"
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="relative flex-[2]">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요."
                className="h-12 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 pr-12 text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={addPayer}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)]"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto px-6 py-4">
          <div className="mb-2 grid grid-cols-2 items-center">
            <div className="text-sm font-medium text-[var(--foreground-muted)]">추가된 이름</div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-[var(--foreground-muted)]">추가된 학번</div>
              {payers.length > 0 && (
                <button
                  onClick={() => setPayers([])}
                  className="rounded-md p-1 text-[var(--foreground-subtle)] hover:bg-[var(--error-bg)] hover:text-[var(--error)]"
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
                className="group relative grid grid-cols-2 items-center rounded-lg border border-[var(--border)] px-4 py-3 hover:border-[var(--foreground-subtle)]"
              >
                <div className="text-sm text-[var(--foreground)]">{payer.name}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[var(--foreground-muted)]">{payer.studentId}</div>
                  <button
                    onClick={() => removePayer(payer.id)}
                    className="rounded-md p-1 text-[var(--foreground-subtle)] opacity-0 transition-opacity hover:bg-[var(--error-bg)] hover:text-[var(--error)] group-hover:opacity-100"
                    title="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {payers.length === 0 && (
              <div className="flex h-20 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-sm text-[var(--foreground-subtle)]">
                추가된 납부자가 없습니다
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={handleApply}
            className="h-12 w-full rounded-lg bg-[var(--primary)] text-base font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}
