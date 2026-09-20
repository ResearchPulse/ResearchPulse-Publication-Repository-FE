import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '@/lib/oidc';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const upstreamUrl = new URL('/api/v1/publications/public', preprintApiBaseUrl());
  upstreamUrl.search = new URL(request.url).search;
  try {
    const upstream = await fetch(upstreamUrl, { cache: 'no-store' });
    const contentType = upstream.headers.get('content-type') || 'application/json';
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Public publication catalogue is unavailable.' } }, { status: 502 });
  }
}
