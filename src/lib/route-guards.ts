import { redirect } from 'next/navigation';
import { canAccessArea, getCurrentUser } from './auth-server';
import type { User } from '@/shared/types';

export async function requireAreaAccess(area: 'admin' | 'student'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    // In demo mode, local development, or when backend API is disabled, allow scholar access
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' ||
      process.env.PREPRINT_API_ENABLED !== 'true'
    ) {
      return {
        id: area === 'student' ? 'usr-student-01' : 'usr-admin-01',
        name: area === 'student' ? 'Nguyen Minh An' : 'Dr. Linh Tran',
        email: area === 'student' ? 'an.nguyen@student.hcmut.edu.vn' : 'linh.tran@hyperdata.edu.vn',
        role: area === 'student' ? 'STUDENT' : 'ADMIN',
      };
    }
    redirect(`/api/auth/login?next=/${area}`);
  }
  if (!canAccessArea(user.role, area)) redirect(`/forbidden?area=${area}`);
  return user;
}
