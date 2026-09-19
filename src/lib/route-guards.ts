import { redirect } from 'next/navigation';
import { canAccessArea, getCurrentUser, defaultPathForRole } from './auth-server';
import type { User } from '@/shared/types';

export async function requireAreaAccess(area: 'admin' | 'lecturer' | 'student'): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect(`/login?next=/${area}`);
  }

  if (!canAccessArea(user.role, area)) {
    redirect(defaultPathForRole(user.role));
  }

  return user;
}
