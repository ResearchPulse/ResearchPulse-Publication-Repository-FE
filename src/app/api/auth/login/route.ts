import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

// GET fallback: redirect user directly to the login page
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  const redirectTarget = next ? `/login?next=${encodeURIComponent(next)}` : '/login';
  return NextResponse.redirect(new URL(redirectTarget, url.origin));
}

// POST: Direct credential login (Username/Email + Password)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập tên đăng nhập/email và mật khẩu' },
        { status: 400 }
      );
    }

    const beResponse = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    });

    const data = await beResponse.json().catch(() => null);

    if (!beResponse.ok || !data?.token) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      return NextResponse.json({ error: errorMessage }, { status: beResponse.status || 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
    });

    const expiresAt = data.expiresAt ? Date.parse(data.expiresAt) : NaN;
    const maxAge = Number.isFinite(expiresAt)
      ? Math.max(1, Math.floor((expiresAt - Date.now()) / 1000))
      : 7 * 24 * 60 * 60;

    response.cookies.set('app_session', data.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge,
      path: '/',
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
