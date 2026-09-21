import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

const allowedRoots = new Set(['users', 'overview', 'publications', 'reviews', 'pending-users', 'registrations']);
const allowedMethods = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function isSafeSegment(segment: string) {
  return /^[a-zA-Z0-9_-]+$/.test(segment);
}

function isAllowedAdminPath(path: string[], method: string) {
  const [root, id, resource, action] = path;

  if (root === 'overview') return method === 'GET' && path.length === 1;
  if (root === 'reviews') return method === 'GET' && path.length === 1;
  if (root === 'pending-users') return method === 'GET' && path.length === 1;
  if (root === 'registrations') return method === 'GET' && path.length === 2 && path[1] === 'stream';

  if (root === 'users') {
    if (path.length === 1) return method === 'GET' || method === 'POST';
    if (path.length === 2) return ['GET', 'PATCH', 'DELETE'].includes(method);
    if (path.length === 3 && (resource === 'approve' || resource === 'reject')) return method === 'POST';
    return method === 'PATCH' && path.length === 3 && (resource === 'role' || resource === 'status');
  }

  if (root === 'publications') {
    if (path.length === 1) return method === 'GET';
    if (path.length === 2) return method === 'GET';
    if (path.length === 3 && (resource === 'status' || resource === 'visibility')) return method === 'PATCH';
    if (path.length === 3 && (resource === 'reviews' || resource === 'versions' || resource === 'timeline')) {
      return method === 'GET';
    }
    if (path.length === 4 && resource === 'reviews' && action === 'assign') return method === 'POST';
  }

  return false;
}

function getUpstreamPath(path: string[]) {
  // /api/v1/users CRUD lives under its own prefix, everything else under /api/v1/admin
  if (path[0] === 'users' && path.length <= 2) return '/api/v1/' + path.map((segment) => encodeURIComponent(segment)).join('/');
  const prefix = path[0] === 'publications' ? '/api/v1/' : '/api/v1/admin/';
  return prefix + path.map((segment) => encodeURIComponent(segment)).join('/');
}

async function proxy(request: Request, context: RouteContext) {
  const method = request.method.toUpperCase();
  if (!allowedMethods.has(method)) {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  if (method !== 'GET' && method !== 'HEAD') {
    const requestUrl = new URL(request.url);
    const origin = request.headers.get('origin');
    if (origin && origin !== requestUrl.origin) {
      return NextResponse.json({ error: 'Origin not allowed' }, { status: 403 });
    }
  }

  const { path } = await context.params;
  if (
    !path?.length ||
    !allowedRoots.has(path[0]) ||
    path.some((segment) => !isSafeSegment(segment)) ||
    !isAllowedAdminPath(path, method)
  ) {
    return NextResponse.json({ error: 'Admin API path not allowed' }, { status: 404 });
  }

  const sessionToken = (await cookies()).get('app_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const upstreamUrl = new URL(
    getUpstreamPath(path),
    preprintApiBaseUrl()
  );
  upstreamUrl.search = new URL(request.url).search;
  const headers = new Headers({
    Accept: 'application/json',
    Authorization: 'Bearer ' + sessionToken,
  });
  const contentType = request.headers.get('content-type');
  const init: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };
  const body = method !== 'GET' && method !== 'HEAD' ? await request.text() : null;
  if (body) {
    init.body = body;
    if (contentType) headers.set('Content-Type', contentType);
  }

  try {
    const upstream = await fetch(upstreamUrl, init);

    // SSE: stream through instead of buffering
    if (upstream.body && upstream.headers.get('content-type')?.includes('text/event-stream')) {
      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) responseHeaders.set('Content-Type', upstreamContentType);
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json({ error: 'Admin API unavailable' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
