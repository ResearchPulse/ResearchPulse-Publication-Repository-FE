import { cookies } from 'next/headers';
import { oidcConfig } from './oidc';
import type { Role, User } from './types';

const roles = new Set<Role>(['STUDENT', 'LECTURER', 'ADMIN']);
const studentRoles = new Set<Role>(['STUDENT']);
const adminRoles = new Set<Role>(['LECTURER', 'ADMIN']);

type RawUser = {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
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
    name: raw.name,
    role: normalizeRole(raw.role),
  };
}

export async function getUserFromAccessToken(accessToken: string): Promise<User | null> {
  const response = await fetch(oidcConfig().userinfo, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return normalizeUser(await response.json() as AuthPayload);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sso_access_token')?.value;
  const ssoBase = process.env.SSO_BASE_URL ?? process.env.SSO_API_BASE_URL ?? 'http://localhost:3001';
  const response = await fetch(
    accessToken ? oidcConfig().userinfo : `${ssoBase}/api/v1/auth/me`,
    {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : { Cookie: cookieStore.toString() },
      cache: 'no-store',
    },
  );
  if (!response.ok) return null;
  return normalizeUser(await response.json() as AuthPayload);
}

export function canAccessArea(role: Role | undefined, area: 'student' | 'admin') {
  if (!role) return false;
  return area === 'student' ? studentRoles.has(role) : adminRoles.has(role);
}

export function safeNextPath(value?: string) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return undefined;
  if (value === '/student' || value.startsWith('/student/')) return value;
  if (value === '/admin' || value.startsWith('/admin/')) return value;
  return undefined;
}

export function defaultPathForRole(role?: Role) {
  if (role && studentRoles.has(role)) return '/student/my-preprints';
  if (role && adminRoles.has(role)) return '/admin/dashboard';
  return '/forbidden';
}

export function resolvePostLoginPath(role: Role | undefined, requestedPath?: string) {
  const next = safeNextPath(requestedPath);
  if (next) {
    const area = next === '/student' || next.startsWith('/student/') ? 'student' : 'admin';
    if (canAccessArea(role, area)) return next;
  }
  return defaultPathForRole(role);
}
