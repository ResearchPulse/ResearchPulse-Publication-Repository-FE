import { NextResponse } from 'next/server';
import { safeNextPath } from '../../../../lib/auth-server';
import { createCodeChallenge, getPreprintSsoConfig, preprintApiBaseUrl, randomString } from '../../../../lib/oidc';


export const runtime = 'nodejs';

// GET fallback: redirect user directly to the login page
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const state = randomString();
  const verifier = randomString(48);
  let ssoConfig;

  try {
    ssoConfig = await getPreprintSsoConfig(requestUrl.origin);
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
  const next = safeNextPath(requestUrl.searchParams.get('next') ?? undefined);
  if (next) {
    response.cookies.set('oidc_next', next, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 600, path: '/' });
  } else {
    response.cookies.delete('oidc_next');
  }

  return response;
}

// POST: Handle username/email + password credential login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier?.trim() || !password) {
      return NextResponse.json(
        { error: 'Vui lòng nhập Tên đăng nhập / Email và Mật khẩu' },
        { status: 400 }
      );
    }

    const beResponse = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
      cache: 'no-store',
    });

    const data = await beResponse.json().catch(() => null);

    if (!beResponse.ok) {
      const errorMessage =
        data?.error?.message ||
        data?.message ||
        'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.';
      return NextResponse.json({ error: errorMessage }, { status: beResponse.status || 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: data.user,
      token: data.token,
    });

    if (data.token) {
      const maxAgeSeconds = data.expiresAt
        ? Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000)
        : 7 * 24 * 60 * 60;

      response.cookies.set('app_session', data.token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: Math.max(maxAgeSeconds, 3600),
        path: '/',
      });
    }

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi kết nối máy chủ xác thực' },
      { status: 500 }
    );
  }
}
