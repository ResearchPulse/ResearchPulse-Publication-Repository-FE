import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { oidcConfig } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sso_access_token')?.value;
  const ssoBase = process.env.SSO_BASE_URL ?? process.env.SSO_API_BASE_URL ?? 'http://localhost:3001';
  const response = await fetch(accessToken ? oidcConfig().userinfo : `${ssoBase}/api/v1/auth/me`, { headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : { Cookie: request.headers.get('cookie') ?? '' }, cache: 'no-store' });
  if (!response.ok) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  const payload = await response.json() as { user?: { id: string; name?: string; email: string; role?: string }; sub?: string; name?: string; email?: string };
  const user = payload.user ?? { id: payload.sub ?? '', name: payload.name, email: payload.email ?? '' };
  return NextResponse.json({ user });
}
