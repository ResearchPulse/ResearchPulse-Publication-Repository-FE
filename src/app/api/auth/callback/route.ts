import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { resolvePostLoginPath } from '../../../../lib/auth-server';
import { preprintApiBaseUrl, ssoClientId, ssoRedirectUri } from '../../../../lib/oidc';
import type { User } from '../../../../lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('oidc_state')?.value;
  const verifier = cookieStore.get('oidc_verifier')?.value;
  if (!code || !state || !expectedState || state !== expectedState || !verifier) return NextResponse.json({ error: 'Invalid OIDC callback' }, { status: 400 });
  const redirectUri = ssoRedirectUri(requestUrl.origin);
  const sessionResponse = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/sso/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: verifier, client_id: ssoClientId(), redirect_uri: redirectUri }),
    cache: 'no-store',
  });
  const sessionBody = await sessionResponse.json().catch(() => null) as { success?: boolean; user?: User; token?: string; expiresAt?: string; error?: { message?: string } } | null;
  if (!sessionResponse.ok || !sessionBody?.token || !sessionBody.user) {
    return NextResponse.json({ error: sessionBody?.error?.message ?? 'Preprint session exchange failed' }, { status: 502 });
  }

  const destination = resolvePostLoginPath(sessionBody.user.role, cookieStore.get('oidc_next')?.value);
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
  const expiresAt = sessionBody.expiresAt ? Date.parse(sessionBody.expiresAt) : NaN;
  const maxAge = Number.isFinite(expiresAt) ? Math.max(1, Math.floor((expiresAt - Date.now()) / 1000)) : 7 * 24 * 60 * 60;
  response.cookies.set('app_session', sessionBody.token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge, path: '/' });
  for (const name of ['oidc_state', 'oidc_verifier', 'oidc_next', 'sso_access_token', 'sso_refresh_token']) response.cookies.delete(name);
  return response;
}
