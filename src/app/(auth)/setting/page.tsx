'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getGetAllByKeysQueryOptions,
  getGetAllByKeysQueryKey,
  useUpdateAll,
  useChangeAdminPassword,
} from '@/api-client';

const EXAM_PERIOD_KEYS = ['exam-period.start-date', 'exam-period.end-date'];

export default function SettingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [examPeriod, setExamPeriod] = useState({
    startDate: '',
    endDate: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const { data: configData } = useQuery({
    ...getGetAllByKeysQueryOptions({ keys: EXAM_PERIOD_KEYS }),
    staleTime: 1000 * 60 * 3,
  });

  useEffect(() => {
    if (configData?.configValues) {
      const startDate = configData.configValues.find(
        (v) => v.key === 'exam-period.start-date'
      )?.value ?? '';
      const endDate = configData.configValues.find(
        (v) => v.key === 'exam-period.end-date'
      )?.value ?? '';
      setExamPeriod({ startDate, endDate });
    }
  }, [configData]);

  const { mutate: updateExamPeriod, isPending: isUpdatingExamPeriod } = useUpdateAll({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetAllByKeysQueryKey({ keys: EXAM_PERIOD_KEYS }),
        });
        toast.success('시험기간이 저장되었습니다.');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || '시험기간 저장에 실패했습니다.';
        toast.error(message);
      },
    },
  });

  const { mutate: changePassword, isPending: isChangingPassword } = useChangeAdminPassword({
    mutation: {
      onSuccess: () => {
        toast.success('비밀번호가 변경되었습니다. 다시 로그인해주세요.');
        localStorage.removeItem('token');
        router.push('/login');
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || '비밀번호 변경에 실패했습니다.';
        toast.error(message);
      },
    },
  });

  const handleExamPeriodSave = () => {
    updateExamPeriod({
      data: {
        configValues: [
          { key: 'exam-period.start-date', value: examPeriod.startDate },
          { key: 'exam-period.end-date', value: examPeriod.endDate },
        ],
      },
    });
  };

  const handlePasswordChange = () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      toast.error('비밀번호는 4자 이상이어야 합니다.');
      return;
    }
    changePassword({
      data: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">설정 관리</h1>

      {/* 시험기간 설정 */}
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">시험기간 설정</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            시험기간 동안 서비스 이용이 제한됩니다.
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-[var(--foreground-muted)]">
                시작일
              </label>
              <input
                type="date"
                value={examPeriod.startDate}
                onChange={(e) =>
                  setExamPeriod((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="flex items-center justify-center text-[var(--foreground-subtle)] sm:pb-2">
              ~
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-[var(--foreground-muted)]">
                종료일
              </label>
              <input
                type="date"
                value={examPeriod.endDate}
                onChange={(e) =>
                  setExamPeriod((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <button
              onClick={handleExamPeriodSave}
              disabled={isUpdatingExamPeriod}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isUpdatingExamPeriod ? '저장 중...' : '저장'}
            </button>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <div className="border-b border-[var(--border)] bg-[var(--background)] px-6 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">공통 비밀번호 변경</h2>
          </div>
          <p className="mt-1 text-sm text-[var(--foreground-subtle)]">
            빌릴게 어드민 페이지 접근에 사용되는 공통 비밀번호를 변경합니다.
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:max-w-md">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground-muted)]">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="현재 비밀번호를 입력하세요"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground-muted)]">
                새 비밀번호
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="새 비밀번호를 입력하세요"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--foreground-muted)]">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="새 비밀번호를 다시 입력하세요"
                className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input)] px-4 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="pt-2">
              <button
                onClick={handlePasswordChange}
                disabled={isChangingPassword}
                className="flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock className="h-4 w-4" />
                {isChangingPassword ? '변경 중...' : '비밀번호 변경'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
