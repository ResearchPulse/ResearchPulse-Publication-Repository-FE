import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from '../../../../lib/oidc';

export const runtime = 'nodejs';

const allowedRoots = new Set(['users', 'dashboard', 'preprints']);
const allowedMethods = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

function isSafeSegment(segment: string) {
  return /^[a-zA-Z0-9_-]+$/.test(segment);
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
  if (!path?.length || !allowedRoots.has(path[0]) || path.some((segment) => !isSafeSegment(segment))) {
    return NextResponse.json({ error: 'Admin API path not allowed' }, { status: 404 });
  }

  const sessionToken = (await cookies()).get('app_session')?.value;
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const upstreamUrl = new URL(
    '/api/v1/admin/' + path.map((segment) => encodeURIComponent(segment)).join('/'),
    preprintApiBaseUrl()
  );
  upstreamUrl.search = new URL(request.url).search;
  const headers = new Headers({
    Accept: 'application/json',
    Authorization: 'Bearer ' + sessionToken,
  });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  const init: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };
  if (method !== 'GET' && method !== 'HEAD') {
    init.body = await request.text();
  }

  try {
    const upstream = await fetch(upstreamUrl, init);
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
