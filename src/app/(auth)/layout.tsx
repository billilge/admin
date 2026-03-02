'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useState, useEffect, useCallback } from 'react';
import {
  Package,
  Users,
  FileText,
  UserCog,
  Monitor,
  Settings,
  LogOut,
} from 'lucide-react';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import {
  getRoleFromToken,
  getUserInfoFromToken,
  hasPermission,
  ROLE_LABEL,
  type Role,
  type UserInfo,
} from '@/lib/auth';
import AccessDeniedModal from '@/components/modal/AccessDeniedModal';

type AuthLayoutProps = {
  children: ReactNode;
};

const navItems = [
  { name: '대여/반납 조회', href: '/rental', icon: FileText },
  { name: '물품 관리', href: '/item', icon: Package },
  { name: '학생회비 납부자 관리', href: '/payer', icon: Users },
  { name: '관리자 관리', href: '/admin', icon: UserCog },
  { name: '디스플레이 관리', href: '/display', icon: Monitor },
  { name: '설정 관리', href: '/setting', icon: Settings },
];

export default function AuthLayout({ children }: AuthLayoutProps) {
  useAuthRedirect();
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  useEffect(() => {
    setRole(getRoleFromToken());
    setUserInfo(getUserInfoFromToken());
  }, []);

  // 현재 URL이 권한 없는 페이지인 경우 리다이렉트
  useEffect(() => {
    if (role && !hasPermission(pathname, role)) {
      setShowAccessDenied(true);
      router.replace('/rental');
    }
  }, [pathname, role, router]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      if (!hasPermission(href, role)) {
        e.preventDefault();
        setShowAccessDenied(true);
      }
    },
    [role],
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-20 flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--sidebar)]">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
          <Link href="/rental" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[var(--primary)]">빌릴게</span>
            <span className="text-sm text-[var(--sidebar-muted)]">관리자 시스템</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const permitted = hasPermission(item.href, role);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      !permitted
                        ? 'cursor-not-allowed text-[var(--foreground-subtle)] opacity-50'
                        : isActive
                          ? 'bg-[var(--sidebar-active)] text-[var(--primary)]'
                          : 'text-[var(--foreground-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-[var(--border)] p-3">
          {userInfo && (
            <div className="mb-2 rounded-lg bg-[var(--sidebar-hover)] px-3 py-2.5 flex-col">
              <div className="flex flex-row justify-between">
                <p className="text-sm font-medium text-[var(--foreground)]">{userInfo.name}</p>
                <span className="inline-block rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-medium text-white">
                  {ROLE_LABEL[userInfo.role]}
                </span>
              </div>
              <p className="text-xs text-[var(--foreground-muted)]">{userInfo.studentId}</p>
            </div>
          )}
          <button
            onClick={() => {
              localStorage.removeItem('token');
              router.push('/login');
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--error)] cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>

      {/* Access Denied Modal */}
      <AccessDeniedModal isOpen={showAccessDenied} onClose={() => setShowAccessDenied(false)} />
    </div>
  );
}
