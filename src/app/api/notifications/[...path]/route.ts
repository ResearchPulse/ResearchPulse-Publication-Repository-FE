import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '@/lib/oidc';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const sessionToken = (await cookies()).get('app_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const { path } = await context.params;

  // SSE Stream
  if (path.length === 1 && path[0] === 'stream') {
    try {
      const upstream = await fetch(`${preprintApiBaseUrl()}/api/v1/notifications/stream`, {
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: 'no-store',
      });

      return new Response(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } catch {
      return NextResponse.json({ success: false, message: 'Failed to connect to SSE stream' }, { status: 502 });
    }
  }

  // Unread Count
  if (path.length === 1 && path[0] === 'unread-count') {
    try {
      const upstream = await fetch(`${preprintApiBaseUrl()}/api/v1/notifications/unread-count`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: 'no-store',
      });
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    } catch {
      return NextResponse.json({ success: false, message: 'Failed to fetch unread count' }, { status: 502 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const sessionToken = (await cookies()).get('app_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ success: false, message: 'Unauthenticated' }, { status: 401 });
  }

  const { path } = await context.params;

  // Mark all as read
  if (path.length === 1 && path[0] === 'read-all') {
    try {
      const upstream = await fetch(`${preprintApiBaseUrl()}/api/v1/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: 'no-store',
      });
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    } catch {
      return NextResponse.json({ success: false, message: 'Failed to mark all as read' }, { status: 502 });
    }
  }

  // Mark single as read: /api/notifications/:id/read
  if (path.length === 2 && path[1] === 'read') {
    const id = path[0];
    try {
      const upstream = await fetch(`${preprintApiBaseUrl()}/api/v1/notifications/${encodeURIComponent(id)}/read`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        cache: 'no-store',
      });
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    } catch {
      return NextResponse.json({ success: false, message: 'Failed to mark notification as read' }, { status: 502 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
