import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { resolvePostLoginPath } from '../../../lib/auth-server';
import { getPreprintSsoConfig, preprintApiBaseUrl } from '../../../lib/oidc';
import type { User } from '../../../shared/types';

export const runtime = 'nodejs';

/**
 * Legacy SSO callback route: Central SSO has been deprecated in favor of direct credentials.
 * Automatically redirect any residual callbacks to the login page.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const providerError = requestUrl.searchParams.get('error');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('oidc_state')?.value;
  const verifier = cookieStore.get('oidc_verifier')?.value;

  if (providerError || !code || !state || !expectedState || state !== expectedState || !verifier) {
    return NextResponse.json({ error: 'Invalid OIDC callback' }, { status: 400 });
  }

  let ssoConfig;

  try {
    ssoConfig = await getPreprintSsoConfig(requestUrl.origin);
  } catch {
    return NextResponse.json(
      { error: 'Preprint SSO configuration is unavailable' },
      { status: 502 }
    );
  }

  const sessionResponse = await fetch(preprintApiBaseUrl() + '/api/v1/auth/sso/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      code_verifier: verifier,
      client_id: ssoConfig.clientId,
      redirect_uri: ssoConfig.redirectUri,
    }),
    cache: 'no-store',
  });
  const sessionBody = await sessionResponse.json().catch(() => null) as {
    success?: boolean;
    user?: User;
    token?: string;
    expiresAt?: string;
    error?: { message?: string };
  } | null;

  if (!sessionResponse.ok || !sessionBody?.token || !sessionBody.user) {
    return NextResponse.json(
      { error: sessionBody?.error?.message ?? 'Admin session exchange failed' },
      { status: 502 }
    );
  }

  const destination = resolvePostLoginPath(
    sessionBody.user.role,
    cookieStore.get('oidc_next')?.value
  );
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
  const expiresAt = sessionBody.expiresAt ? Date.parse(sessionBody.expiresAt) : Number.NaN;
  const maxAge = Number.isFinite(expiresAt)
    ? Math.max(1, Math.floor((expiresAt - Date.now()) / 1000))
    : 7 * 24 * 60 * 60;

  response.cookies.set('app_session', sessionBody.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    path: '/',
  });

  for (const name of ['oidc_state', 'oidc_verifier', 'oidc_next']) {
    response.cookies.delete(name);
  }

  return response;

}
