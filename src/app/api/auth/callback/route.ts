import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getUserFromAccessToken, resolvePostLoginPath } from '../../../../lib/auth-server';
import { oidcConfig } from '../../../../lib/oidc';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const cookieStore = await cookies();
  const expectedState = cookieStore.get('oidc_state')?.value;
  const verifier = cookieStore.get('oidc_verifier')?.value;
  if (!code || !state || !expectedState || state !== expectedState || !verifier) return NextResponse.json({ error: 'Invalid OIDC callback' }, { status: 400 });
  const tokenResponse = await fetch(oidcConfig().token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ grant_type: 'authorization_code', client_id: process.env.SSO_CLIENT_ID ?? 'hyperlabdata-preprint-admin', client_secret: process.env.SSO_CLIENT_SECRET, code, redirect_uri: `${requestUrl.origin}/api/auth/callback`, code_verifier: verifier }) });
  if (!tokenResponse.ok) return NextResponse.json({ error: 'Token exchange failed' }, { status: 502 });
  const tokens = await tokenResponse.json() as { access_token: string; refresh_token?: string; expires_in?: number };
  const identity = await getUserFromAccessToken(tokens.access_token).catch(() => null);
  const destination = resolvePostLoginPath(identity?.role, cookieStore.get('oidc_next')?.value);
  const response = NextResponse.redirect(new URL(destination, requestUrl.origin));
  response.cookies.set('sso_access_token', tokens.access_token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: tokens.expires_in ?? 900, path: '/' });
  if (tokens.refresh_token) response.cookies.set('sso_refresh_token', tokens.refresh_token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 30, path: '/' });
  for (const name of ['oidc_state', 'oidc_nonce', 'oidc_verifier', 'oidc_next']) response.cookies.delete(name);
  return response;
}
