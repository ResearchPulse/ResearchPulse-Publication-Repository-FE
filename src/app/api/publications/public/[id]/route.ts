import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '@/lib/oidc';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    return NextResponse.json({ success: false, error: { message: 'Invalid publication id.' } }, { status: 400 });
  }
  const upstreamUrl = new URL(`/api/v1/publications/public/${encodeURIComponent(id)}`, preprintApiBaseUrl());
  try {
    const upstream = await fetch(upstreamUrl, { cache: 'no-store' });
    const contentType = upstream.headers.get('content-type') || 'application/json';
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: { 'Content-Type': contentType },
    });
  } catch {
    return NextResponse.json({ success: false, error: { message: 'Public publication is unavailable.' } }, { status: 502 });
  }
}
