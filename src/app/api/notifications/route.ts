import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '@/lib/oidc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const sessionToken = (await cookies()).get('app_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const reqUrl = new URL(request.url);
  const upstreamUrl = new URL('/api/v1/notifications', preprintApiBaseUrl());
  upstreamUrl.search = reqUrl.search;

  try {
    const upstream = await fetch(upstreamUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${sessionToken}`,
      },
      cache: 'no-store',
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications from backend' }, { status: 502 });
  }
}
