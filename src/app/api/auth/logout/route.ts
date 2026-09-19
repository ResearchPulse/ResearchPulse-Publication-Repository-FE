import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

async function performLogout() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('app_session')?.value;

  if (sessionToken) {
    await fetch(`${preprintApiBaseUrl()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
    }).catch(() => undefined);
  }
}

export async function POST() {
  await performLogout();
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('app_session');
  return response;
}

export async function GET(request: Request) {
  // Prevent Next.js prefetch from accidentally executing logout
  const isPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1';

  if (isPrefetch) {
    return new NextResponse(null, { status: 204 });
  }

  await performLogout();
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.delete('app_session');
  return response;
}

