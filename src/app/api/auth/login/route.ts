import { NextResponse } from 'next/server';
import { safeNextPath } from '../../../../lib/auth-server';
import { createCodeChallenge, getPreprintSsoConfig, randomString } from '../../../../lib/oidc';

export const runtime = 'nodejs';

// Route for OIDC login
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = randomString();
  const verifier = randomString(48);
  let ssoConfig;

  try {
    ssoConfig = await getPreprintSsoConfig(url.origin);
  } catch {
    return NextResponse.json(
      { error: 'Preprint SSO configuration is unavailable' },
      { status: 502 }
    );
  }

  const authorizeUrl = new URL(`${ssoConfig.ssoApiUrl}/api/v1/oidc/authorize`);
  authorizeUrl.search = new URLSearchParams({ client_id: ssoConfig.clientId, redirect_uri: ssoConfig.redirectUri, response_type: 'code', scope: 'openid profile email', state, code_challenge: createCodeChallenge(verifier), code_challenge_method: 'S256' }).toString();
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
