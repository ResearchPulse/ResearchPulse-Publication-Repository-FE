import type { User } from '@/shared/types';

export const authApi = {
  async me(): Promise<User | null> {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const body = await response.json() as { user?: User };
    return body.user || null;
  },

  async login(identifier: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Đăng nhập thất bại' };
    }
    return { success: true, user: data.user };
  },

  async register(params: { firstName: string; lastName: string; email: string; studentId: string; major: string }) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đăng ký thất bại');
    }
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đặt lại mật khẩu thất bại');
    }
    return data;
  },

  async updateProfile(params: {
    name?: string;
    firstName?: string;
    lastName?: string;
    studentId?: string;
    major?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; message?: string; user?: User }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || 'Cập nhật hồ sơ thất bại');
    }
    return data;
  },

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  },

  loginUrl: '/login',
  registerUrl: '/register',
  logoutUrl: '/api/auth/logout',
};

export default authApi;
