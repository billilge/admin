'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import useAuthRedirect from '@/hooks/useAuthRedirect';

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  useAuthRedirect(); // 진입 시 토큰 유효성 판단 후 로그인 페이지 혹은 메인 페이지로 이동
  return (
    <div className="min-h-screen bg-[#f9fbfc]">
      <header className="sticky top-0 z-10 border-b border-[#e5e8eb] bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-lg font-bold text-[#191f28] hover:bg-[#f2f4f6]"
            >
              <span className="text-[#004A98]">빌릴게</span>
              <span className="hidden md:inline">복지물품 대여 시스템</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex md:gap-2">
            <Link
              href="/rental"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] hover:text-[#191f28]"
            >
              대여/반납 조회
            </Link>
            <Link
              href="/admin"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] hover:text-[#191f28]"
            >
              관리자 관리
            </Link>
            <Link
              href="/payer"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] hover:text-[#191f28]"
            >
              납부자 관리
            </Link>
            <Link
              href="/item"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] hover:text-[#191f28]"
            >
              물품 관리
            </Link>
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] hover:text-[#191f28]"
            >
              로그아웃
            </Link>
          </nav>
          <div className="flex md:hidden">
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#4e5968] hover:bg-[#f2f4f6] hover:text-[#191f28]"
            >
              로그아웃
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 pb-20 md:px-6 md:pb-8">{children}</main>
    </div>
  );
}
