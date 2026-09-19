import { redirect } from 'next/navigation';
import { canAccessArea, defaultPathForRole, getCurrentUser } from './auth-server';
import type { User } from '@/shared/types';

export async function requireAreaAccess(area: 'admin' | 'lecturer' | 'student'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {

    redirect(`/api/auth/login?next=/${area}`);

  }
  if (!canAccessArea(user.role, area)) {
    redirect(defaultPathForRole(user.role));
  }
  return user;
}
