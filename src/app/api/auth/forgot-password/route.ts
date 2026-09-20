import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email hoặc tên đăng nhập' },
        { status: 400 }
      );
    }

    const beResponse = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
      cache: 'no-store',
    });

    const data = await beResponse.json().catch(() => null);

    if (!beResponse.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'Yêu cầu cấp lại mật khẩu thất bại. Vui lòng thử lại sau.';
      return NextResponse.json({ error: errorMessage }, { status: beResponse.status || 400 });
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      devResetLink: data.devResetLink,
      devToken: data.devToken,
      email: data.email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ' },
      { status: 500 }
    );
  }
}
