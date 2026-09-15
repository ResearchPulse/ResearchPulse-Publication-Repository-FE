import { NextResponse } from 'next/server';
import { createCodeChallenge, oidcConfig, randomString } from '../../../../lib/oidc';

export const runtime = 'nodejs';

// Route for OIDC login
export async function GET(request: Request) {
  const url = new URL(request.url);
  const state = randomString();
  const nonce = randomString();
  const verifier = randomString(48);
  const redirectUri = `${url.origin}/api/auth/callback`;
  const authorizeUrl = new URL(oidcConfig().authorize);
  authorizeUrl.search = new URLSearchParams({ client_id: process.env.SSO_CLIENT_ID ?? 'hyperlabdata-preprint-admin', redirect_uri: redirectUri, response_type: 'code', scope: 'openid profile email', state, nonce, code_challenge: createCodeChallenge(verifier), code_challenge_method: 'S256' }).toString();
  const response = NextResponse.redirect(authorizeUrl);
  for (const [name, value] of [['oidc_state', state], ['oidc_nonce', nonce], ['oidc_verifier', verifier]] as const) response.cookies.set(name, value, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  return response;
}
