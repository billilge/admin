'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
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
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
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

        {/* Logout */}
        <div className="border-t border-[var(--border)] p-3">
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--error)]"
          >
            <LogOut className="h-5 w-5" />
            로그아웃
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">{children}</main>
    </div>
  );
}
