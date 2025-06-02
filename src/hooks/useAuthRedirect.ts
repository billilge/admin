import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getCookie } from '@/utils/cookie';

export const useAuthRedirect = () => {
  const router = useRouter();
  // const token = getCookie('token');
  const token = localStorage.getItem('token');

  useEffect(() => {
    // console.log(token);
    // console.log(document.cookie);

    if (!token) {
      router.push('/login');
    }
  }, [token, router]);
};
