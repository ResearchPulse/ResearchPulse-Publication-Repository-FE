import { proxyPreprintRequest } from '../../../lib/preprint-bff';

export const runtime = 'nodejs';
export const GET = (request: Request) => proxyPreprintRequest(request, []);
export const POST = (request: Request) => proxyPreprintRequest(request, []);
