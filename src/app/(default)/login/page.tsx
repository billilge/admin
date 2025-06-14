'use client';

import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef } from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const studentIdRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const validateLoginForm = (studentId: string, password: string) => {
    if (!studentId) {
      toast.error('학번을 입력해 주세요!');
      return false;
    }

    if (!password) {
      toast.error('비밀번호를 입력해 주세요!');
      return false;
    }

    const idRegex = /^\d{8}$/;
    if (!idRegex.test(studentId)) {
      toast.error('학번은 숫자 8자리여야 합니다.');
      return false;
    }

    return true;
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateLoginForm(studentId, password)) return;

    await toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, password }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || '로그인 실패');
          }
          return res.json();
        })
        .then((data) => {
          localStorage.setItem('token', data.accessToken);
          router.push('/');
        }),
      {
        loading: '로그인 중...',
        success: '로그인에 성공했습니다!',
        error: (err: any) => err.message || '관리자 로그인 중 오류가 발생했습니다!',
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f9fbfc] p-4 md:flex-row">
      <div className="mb-8 flex w-full max-w-md flex-col items-center md:mb-0 md:mr-12 md:items-start">
        <div className="mb-6 text-center md:text-left">
          <div className="mb-2 text-sm font-medium text-[#004A98]">
            국민대학교 소프트웨어융합대학
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#191f28] md:text-4xl">
            복지물품 대여 시스템
          </h1>
          <p className="mt-3 text-[#8b95a1]">학번과 비밀번호를 입력하여 로그인하세요.</p>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-md bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="studentId" className="block text-sm font-medium text-[#4e5968]">
                학번
              </label>
              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="h-12 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#3182f6] focus:outline-none focus:ring-1 focus:ring-[#3182f6]"
                placeholder="학번을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#4e5968]">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-md border border-[#e5e8eb] bg-[#f9fbfc] px-4 text-[#191f28] placeholder:text-[#8b95a1] focus:border-[#3182f6] focus:outline-none focus:ring-1 focus:ring-[#3182f6]"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b95a1] hover:text-[#4e5968]"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-md bg-[#004A98] text-base font-medium text-white hover:bg-[#003a7a] focus:outline-none focus:ring-2 focus:ring-[#004A98] focus:ring-offset-2"
            >
              로그인
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <div className="mt-6 flex justify-center space-x-4 text-sm">
            <Link href="#" className="text-[#8b95a1] hover:text-[#4e5968]">
              비밀번호 찾기
            </Link>
            <div className="text-[#e5e8eb]">|</div>
            <Link href="#" className="text-[#8b95a1] hover:text-[#4e5968]">
              관리자 문의
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#8b95a1]">
          © {new Date().getFullYear()} 국민대학교 소프트웨어융합대학. All rights reserved.
        </div>
      </div>
    </div>
  );
}
