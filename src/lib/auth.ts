export type Role = 'ADMIN' | 'GA' | 'WORKER' | 'USER';

/**
 * JWT 토큰 페이로드에서 역할(role) 정보를 추출합니다.
 */
export function getRoleFromToken(): Role | null {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decoded = JSON.parse(atob(payload));
    return decoded.role ?? null;
  } catch {
    return null;
  }
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
