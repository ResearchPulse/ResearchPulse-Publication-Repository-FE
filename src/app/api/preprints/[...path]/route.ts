import { proxyPreprintRequest } from '../../../../lib/preprint-bff';

export const runtime = 'nodejs';
type Context = { params: Promise<{ path: string[] }> };
async function handle(request: Request, context: Context) { return proxyPreprintRequest(request, (await context.params).path || []); }
export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const PUT = handle;
export const DELETE = handle;
