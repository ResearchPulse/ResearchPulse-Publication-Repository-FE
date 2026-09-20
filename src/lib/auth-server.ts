import { cookies } from 'next/headers';
import { preprintApiBaseUrl } from './oidc';
import type { Role, User } from '@/shared/types';

const roles = new Set<Role>(['STUDENT', 'LECTURER', 'ADMIN']);
const adminRoles = new Set<Role>(['ADMIN']);
const lecturerRoles = new Set<Role>(['LECTURER']);
const studentRoles = new Set<Role>(['STUDENT']);

type RawUser = {
  id?: string;
  sub?: string;
  email?: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  studentId?: string | null;
  major?: string | null;
  avatarUrl?: string | null;
  role?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type AuthPayload = RawUser & { user?: RawUser };

function normalizeRole(value?: string): Role | undefined {
  const role = value?.trim().toUpperCase() as Role | undefined;
  return role && roles.has(role) ? role : undefined;
}

function normalizeUser(payload: AuthPayload): User | null {
  const raw = payload.user ?? payload;
  const id = raw.id ?? raw.sub;
  if (!id) return null;

  return {
    id,
    email: raw.email ?? '',
    name: raw.name ?? undefined,
    firstName: raw.firstName ?? undefined,
    lastName: raw.lastName ?? undefined,
    studentId: raw.studentId ?? undefined,
    major: raw.major ?? undefined,
    avatarUrl: raw.avatarUrl ?? undefined,
    role: normalizeRole(raw.role),
    status: raw.status ?? undefined,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function getUserFromAccessToken(accessToken: string): Promise<User | null> {
  try {
    const response = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return normalizeUser(await response.json() as AuthPayload);
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('app_session')?.value;
    if (!sessionToken) return null;

    const response = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/me`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return normalizeUser(await response.json() as AuthPayload);
  } catch {
    return null;
  }
}

export function canAccessArea(role: Role | undefined, area: 'admin' | 'lecturer' | 'student') {
  if (!role) return false;
  if (area === 'admin') return adminRoles.has(role);
  if (area === 'lecturer') return lecturerRoles.has(role);
  return studentRoles.has(role);
}

export function safeNextPath(value?: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return undefined;
  if (value === '/admin' || value.startsWith('/admin/')) return value;
  if (value === '/lecturer' || value.startsWith('/lecturer/')) return value;
  if (value === '/student' || value.startsWith('/student/')) return value;
  return undefined;
}

export function defaultPathForRole(role?: Role) {
  if (role === 'STUDENT') return '/student/my-preprints';
  if (role && lecturerRoles.has(role)) return '/lecturer/reviews';
  if (role && adminRoles.has(role)) return '/admin/dashboard';
  return '/forbidden';
}

export function resolvePostLoginPath(role: Role | undefined, requestedPath?: string) {
  const next = safeNextPath(requestedPath);
  if (next) {
    const area = next === '/student' || next.startsWith('/student/')
      ? 'student'
      : next === '/lecturer' || next.startsWith('/lecturer/')
        ? 'lecturer'
        : 'admin';
    if (canAccessArea(role, area)) return next;
  }
  return defaultPathForRole(role);
}
