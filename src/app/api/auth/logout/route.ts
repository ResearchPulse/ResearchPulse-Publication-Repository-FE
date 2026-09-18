import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('app_session')?.value;

  if (sessionToken) {
    await fetch(`${preprintApiBaseUrl()}/api/v1/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sessionToken}` },
    }).catch(() => undefined);
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete('app_session');
  return response;
}
