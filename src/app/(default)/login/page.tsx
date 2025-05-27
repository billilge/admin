'use client';

import { useRouter } from 'next/navigation';
// import ImageLoginLogo from 'public/assets/images/image-login-logo.svg';
import { useRef } from 'react';
import toast from 'react-hot-toast';
import { useLoginAdmin } from '@/api-client';
import { Button } from '@/components/ui/button';

export default function Login() {
  const router = useRouter();
  const studentIdRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const loginMutation = useLoginAdmin();

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

  const handleAdminLogin = async (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.preventDefault();

    const studentId = studentIdRef.current?.value || '';
    const password = passwordRef.current?.value || '';

    if (!validateLoginForm(studentId, password)) return;

    await toast.promise(
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/admin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // credentials: 'include', // 쿠키 필요 시
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
          router.push('/main');
        }),
      {
        loading: '로그인 중...',
        success: '로그인에 성공했습니다!',
        error: (err: any) => err.message || '관리자 로그인 중 오류가 발생했습니다!',
      },
    );
  };

  return (
    <div className="flex min-h-screen flex-row items-center justify-center gap-80 p-8 pb-20">
      <section>{/*<ImageLoginLogo />*/}</section>
      <section className="flex w-[512px] flex-col items-center justify-center">
        <div className="flex w-[300px] flex-col items-center justify-center gap-11 text-center">
          <div>
            <h1>국민대학교 소프트웨어융합대학</h1>
            <p className="text-3xl font-bold">복지물품 대여 시스템</p>
          </div>
          <div className="flex w-full flex-col items-center justify-center gap-5">
            <input
              className="w-full border-b-2 border-gray-secondary pb-1 pl-1 pt-1 text-start text-body-1-normal_medi placeholder-gray-secondary placeholder:text-body-1-normal_medi focus:outline-none"
              type="text"
              placeholder="학번"
              ref={studentIdRef}
            />
            <input
              className="w-full border-b-2 border-gray-secondary pb-1 pl-1 pt-1 text-start text-body-1-normal_medi placeholder-gray-secondary placeholder:text-body-1-normal_medi focus:outline-none"
              type="password"
              placeholder="비밀번호"
              ref={passwordRef}
            />
          </div>
          <div className="w-full items-center justify-center">
            <Button type="button" onClick={handleAdminLogin} className="w-full">
              로그인
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
