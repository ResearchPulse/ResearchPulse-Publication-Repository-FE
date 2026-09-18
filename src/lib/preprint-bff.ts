import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { preprintApiBaseUrl } from './oidc';

const allowedMethods = new Set(['GET', 'POST', 'PATCH', 'PUT', 'DELETE']);
const pendingMessage = 'API nghiệp vụ chưa được triển khai ở Public BE. FE đã sẵn sàng theo contract; cần bổ sung API để kích hoạt tính năng.';

function safeSegment(value: string) { return /^[a-zA-Z0-9_-]+$/.test(value); }

function allowedPath(path: string[]) {
  if (path.some((segment) => !safeSegment(segment))) return false;
  if (!path.length) return true;
  if (path.length === 1) return path[0] === 'upload-direct' || path[0].length >= 2;
  if (path.length === 2) return ['status', 'reviews', 'versions', 'timeline', 'dev-submit'].includes(path[1]);
  if (path.length === 3) return path[1] === 'revisions' && path[2] === 'upload-direct';
  return false;
}

function upstreamPath(path: string[]) {
  if (!path.length) return '/api/v1/publications/';
  return '/api/v1/publications/' + path.map((segment) => encodeURIComponent(segment)).join('/');
}

export async function proxyPreprintRequest(request: Request, path: string[]) {
  if (!allowedMethods.has(request.method.toUpperCase())) return NextResponse.json({ success: false, code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed.' }, { status: 405 });
  if (!allowedPath(path)) return NextResponse.json({ success: false, code: 'PATH_NOT_ALLOWED', message: 'Preprint API path not allowed.' }, { status: 404 });
  if (process.env.PREPRINT_API_ENABLED !== 'true') return NextResponse.json({ success: false, code: 'API_NOT_AVAILABLE', message: pendingMessage }, { status: 501 });

  const sessionToken = (await cookies()).get('app_session')?.value;
  if (!sessionToken) return NextResponse.json({ success: false, code: 'UNAUTHENTICATED', message: 'Authentication is required.' }, { status: 401 });
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== requestUrl.origin) return NextResponse.json({ success: false, code: 'ORIGIN_NOT_ALLOWED', message: 'Origin is not allowed.' }, { status: 403 });

  const upstreamUrl = new URL(upstreamPath(path), preprintApiBaseUrl());
  upstreamUrl.search = requestUrl.search;
  const headers = new Headers({ Accept: 'application/json', Authorization: 'Bearer ' + sessionToken });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const method = request.method.toUpperCase();
  const init: RequestInit = { method, headers, cache: 'no-store' };
  if (method !== 'GET' && method !== 'HEAD') init.body = await request.arrayBuffer();

  try {
    const upstream = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers();
    const upstreamContentType = upstream.headers.get('content-type');
    if (upstreamContentType) responseHeaders.set('Content-Type', upstreamContentType);
    return new NextResponse(await upstream.arrayBuffer(), { status: upstream.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ success: false, code: 'API_UNAVAILABLE', message: 'Public BE is unavailable.' }, { status: 502 });
  }
}
