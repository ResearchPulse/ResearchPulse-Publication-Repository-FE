import { redirect } from 'next/navigation';
import { canAccessArea, getCurrentUser } from './auth-server';

export async function requireAreaAccess(area: 'student' | 'admin') {
  const user = await getCurrentUser();
  if (!user) redirect(`/api/auth/login?next=/${area}`);
  if (!canAccessArea(user.role, area)) redirect(`/forbidden?area=${area}`);
  return user;
}
