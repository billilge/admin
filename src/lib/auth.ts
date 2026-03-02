import { decode } from 'js-base64';

export type Role = 'ADMIN' | 'GA' | 'WORKER' | 'USER';

export interface UserInfo {
  name: string;
  studentId: string;
  role: Role;
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '관리자',
  GA: '총무부',
  WORKER: '근무자',
  USER: '사용자',
};

function decodeTokenPayload(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(decode(payload));
  } catch {
    return null;
  }
}

/**
 * JWT 토큰 페이로드에서 역할(role) 정보를 추출합니다.
 */
export function getRoleFromToken(): Role | null {
  const decoded = decodeTokenPayload();
  return (decoded?.role as Role) ?? null;
}

/**
 * JWT 토큰 페이로드에서 사용자 정보(이름, 학번, 역할)를 추출합니다.
 */
export function getUserInfoFromToken(): UserInfo | null {
  const decoded = decodeTokenPayload();
  if (!decoded?.role || !decoded?.name || !decoded?.sub) return null;

  return {
    name: decoded.name as string,
    studentId: decoded.sub as string,
    role: decoded.role as Role,
  };
}

/** 각 라우트별 접근 가능한 역할 목록 */
const routePermissions: Record<string, Role[]> = {
  '/rental': ['ADMIN', 'GA', 'WORKER'],
  '/item': ['ADMIN'],
  '/payer': ['ADMIN', 'GA'],
  '/admin': ['ADMIN'],
  '/display': ['ADMIN'],
  '/setting': ['ADMIN'],
};

/**
 * 특정 경로에 대해 해당 역할이 접근 가능한지 확인합니다.
 */
export function hasPermission(pathname: string, role: Role | null): boolean {
  if (!role) return false;

  const allowedRoles = routePermissions[pathname];
  if (!allowedRoles) return true; // 정의되지 않은 경로는 기본 허용

  return allowedRoles.includes(role);
}
