import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, studentId, major } = body;

    if (!firstName || !lastName || !email || !studentId || !major) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ các trường: Họ đệm, Tên, Email, MSSV và Chuyên ngành' },
        { status: 400 }
      );
    }

    const beResponse = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName, email, phone, studentId, major }),
      cache: 'no-store',
    });

    const data = await beResponse.json().catch(() => null);

    if (!beResponse.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.';
      return NextResponse.json({ error: errorMessage }, { status: beResponse.status || 400 });
    }

    return NextResponse.json({
      success: true,
      message: data.message,
      user: data.user,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
