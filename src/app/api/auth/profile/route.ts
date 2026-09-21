import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('app_session')?.value;
    const authHeader = request.headers.get('authorization');
    const token = sessionToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined);

    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' }, { status: 401 });
    }

    const body = await request.json();

    const beResponse = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const data = await beResponse.json().catch(() => null);

    if (!beResponse.ok) {
      return NextResponse.json(
        { error: data?.error?.message || data?.message || 'Cập nhật hồ sơ không thành công' },
        { status: beResponse.status || 400 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ' },
      { status: 500 }
    );
  }
}
