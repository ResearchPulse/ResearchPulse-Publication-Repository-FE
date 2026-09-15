import type { User } from './types';

export const authClient = {
  async me(): Promise<User | null> {
    const response = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' });
    if (!response.ok) return null;
    const body = await response.json() as { user?: User };
    return body.user || null;
  },
  loginUrl: '/api/auth/login',
  logoutUrl: '/api/auth/logout',
};
