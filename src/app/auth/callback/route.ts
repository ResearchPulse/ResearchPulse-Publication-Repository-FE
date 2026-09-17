import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Legacy SSO callback route: Central SSO has been deprecated in favor of direct credentials.
 * Automatically redirect any residual callbacks to the login page.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
