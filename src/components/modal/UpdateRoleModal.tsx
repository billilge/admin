'use client';

import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useUpdateAdminRole } from '@/api-client';
import { AdminMemberDetailRole } from '@/api-client/model';
import { AdminRoleUpdateRequestRole } from '@/api-client/model';

const ROLE_OPTIONS: { value: AdminRoleUpdateRequestRole; label: string }[] = [
  { value: 'WORKER', label: '근무자' },
  { value: 'GA', label: '총무부' },
  { value: 'ADMIN', label: '관리자' },
];

interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  admin: {
    memberId: number;
    name: string;
    role: AdminMemberDetailRole;
  };
}

export default function UpdateRoleModal({ isOpen, onClose, admin }: UpdateRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<AdminRoleUpdateRequestRole>(admin.role);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useUpdateAdminRole({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/admin/members/admins'] });
        toast.success('권한이 변경되었습니다.');
        onClose();
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || '권한 변경에 실패했습니다.';
        toast.error(message);
      },
    },
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (selectedRole === admin.role) return;
    mutate({ memberId: admin.memberId, data: { role: selectedRole } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-[var(--popover)] shadow-xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">권한 변경</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-[var(--foreground-subtle)] hover:bg-[var(--background-hover)] hover:text-[var(--foreground-muted)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="mb-4 text-sm text-[var(--foreground-muted)]">
            <span className="font-medium text-[var(--foreground)]">{admin.name}</span>의 권한을
            변경합니다.
          </p>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRole(option.value)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  selectedRole === option.value
                    ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                    : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground-muted)] hover:bg-[var(--background-hover)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--background-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--border)] focus:ring-offset-2 cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRole === admin.role || isPending}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? '변경 중...' : '변경'}
          </button>
        </div>
      </div>
    </div>
  );
}
