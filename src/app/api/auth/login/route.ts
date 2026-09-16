import { NextResponse } from 'next/server';
import { safeNextPath } from '../../../../lib/auth-server';
import { createCodeChallenge, oidcConfig, randomString, ssoClientId, ssoRedirectUri } from '../../../../lib/oidc';

export const runtime = 'nodejs';

// Route for OIDC login
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = randomString();
  const verifier = randomString(48);
  const redirectUri = ssoRedirectUri(url.origin);
  const authorizeUrl = new URL(oidcConfig().authorize);
  authorizeUrl.search = new URLSearchParams({ client_id: ssoClientId(), redirect_uri: redirectUri, response_type: 'code', scope: 'openid profile email', state, code_challenge: createCodeChallenge(verifier), code_challenge_method: 'S256' }).toString();
  const response = NextResponse.redirect(authorizeUrl);
  for (const [name, value] of [['oidc_state', state], ['oidc_verifier', verifier]] as const) response.cookies.set(name, value, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  const next = safeNextPath(url.searchParams.get('next') ?? undefined);
  if (next) {
    response.cookies.set('oidc_next', next, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  } else {
    response.cookies.delete('oidc_next');
  }
  return response;
}
