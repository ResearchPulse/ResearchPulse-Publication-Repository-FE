import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { oidcConfig } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('sso_refresh_token')?.value;
  if (refreshToken) await fetch(oidcConfig().logout, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: refreshToken, client_id: process.env.SSO_CLIENT_ID ?? 'hyperlabdata-preprint-admin' }) }).catch(() => undefined);
  const response = NextResponse.redirect(new URL('/', request.url));
  response.cookies.delete('sso_access_token');
  response.cookies.delete('sso_refresh_token');
  return response;
}
