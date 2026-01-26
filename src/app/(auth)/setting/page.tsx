'use client';

import { useState } from 'react';
import { Calendar, Lock, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingPage() {
  // 임시 데이터 - 시험기간
  const [examPeriod, setExamPeriod] = useState({
    startDate: '2025-06-15',
    endDate: '2025-06-21',
  });

  // 임시 데이터 - 비밀번호
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleExamPeriodSave = () => {
    // TODO: API 연동
    toast.success('시험기간이 저장되었습니다.');
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
    // TODO: API 연동
    toast.success('비밀번호가 변경되었습니다.');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#191f28]">설정 관리</h1>

      {/* 시험기간 설정 */}
      <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
        <div className="border-b border-[#e5e8eb] bg-[#f9fbfc] px-6 py-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#004A98]" />
            <h2 className="text-lg font-semibold text-[#191f28]">시험기간 설정</h2>
          </div>
          <p className="mt-1 text-sm text-[#8b95a1]">
            시험기간 동안 서비스 이용이 제한됩니다.
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                시작일
              </label>
              <input
                type="date"
                value={examPeriod.startDate}
                onChange={(e) =>
                  setExamPeriod((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>
            <div className="flex items-center justify-center text-[#8b95a1] sm:pb-2">
              ~
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                종료일
              </label>
              <input
                type="date"
                value={examPeriod.endDate}
                onChange={(e) =>
                  setExamPeriod((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>
            <button
              onClick={handleExamPeriodSave}
              className="flex h-10 shrink-0 items-center gap-2 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              저장
            </button>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 */}
      <div className="overflow-hidden rounded-md border border-[#e5e8eb] bg-white shadow-sm">
        <div className="border-b border-[#e5e8eb] bg-[#f9fbfc] px-6 py-4">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#004A98]" />
            <h2 className="text-lg font-semibold text-[#191f28]">공통 비밀번호 변경</h2>
          </div>
          <p className="mt-1 text-sm text-[#8b95a1]">
            빌릴게 어드민 페이지 접근에 사용되는 공통 비밀번호를 변경합니다.
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col gap-4 sm:max-w-md">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                현재 비밀번호
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="현재 비밀번호를 입력하세요"
                className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                새 비밀번호
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="새 비밀번호를 입력하세요"
                className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#4e5968]">
                새 비밀번호 확인
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="새 비밀번호를 다시 입력하세요"
                className="h-10 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-sm text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#004A98] focus:outline-none focus:ring-1 focus:ring-[#004A98]"
              />
            </div>
            <div className="pt-2">
              <button
                onClick={handlePasswordChange}
                className="flex h-10 items-center gap-2 rounded-md bg-[#004A98] px-4 text-sm font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                비밀번호 변경
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
