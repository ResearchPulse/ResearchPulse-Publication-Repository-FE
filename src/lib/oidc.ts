
import { createHash, randomBytes } from 'node:crypto';

const baseUrl = () => process.env.CENTRAL_SSO_API_URL ?? 'https://auth-api.hyperdatalab.org';
const CANONICAL_CALLBACK_PATH = '/auth/callback';
const LEGACY_CALLBACK_PATH = '/api/auth/callback';

export function oidcConfig() {
  const base = baseUrl();
  return { authorize: `${base}/api/v1/oidc/authorize`, token: `${base}/api/v1/oidc/token`, userinfo: `${base}/api/v1/oidc/userinfo`, logout: `${base}/api/v1/auth/logout` };
}


export function preprintApiBaseUrl() {
  return process.env.PREPRINT_API_BASE_URL ?? process.env.NEXT_PUBLIC_PREPRINT_API_BASE_URL ?? 'http://127.0.0.1:3002';
}


export function ssoClientId() {
  return process.env.SSO_CLIENT_ID ?? 'researchpulse-ecosystem';
}

export function normalizeSsoRedirectUri(value: string, origin: string) {
  const redirectUri = new URL(value, origin);
  const normalizedPath = redirectUri.pathname.replace(/\/$/, '');

  if (normalizedPath === LEGACY_CALLBACK_PATH) {
    redirectUri.pathname = CANONICAL_CALLBACK_PATH;
  }

  redirectUri.search = '';
  redirectUri.hash = '';
  return redirectUri.toString();
}

export function ssoRedirectUri(origin: string) {
  return normalizeSsoRedirectUri(
    process.env.SSO_REDIRECT_URI ?? CANONICAL_CALLBACK_PATH,
    origin
  );
}

interface PreprintSsoConfigResponse {
  success?: boolean;
  data?: {
    clientId?: string;
    ssoApiUrl?: string;
    redirectUri?: string;
  };
}

function browserSsoApiUrl(value: string, origin: string) {
  const ssoApiUrl = new URL(value, origin);
  const browserOrigin = new URL(origin);

  if (['host.docker.internal', 'host-gateway', '0.0.0.0'].includes(ssoApiUrl.hostname)) {
    ssoApiUrl.hostname = browserOrigin.hostname === '127.0.0.1'
      ? '127.0.0.1'
      : 'localhost';
  }

  return ssoApiUrl.toString().replace(/\/+$/, '');
}

export async function getPreprintSsoConfig(origin: string) {
  const response = await fetch(`${preprintApiBaseUrl()}/api/v1/auth/sso/config`, {
    cache: 'no-store',
  });
  const body = await response.json().catch(() => null) as PreprintSsoConfigResponse | null;
  const data = body?.data;

  if (
    !response.ok ||
    !body?.success ||
    !data?.clientId ||
    !data.ssoApiUrl ||
    !data.redirectUri
  ) {
    throw new Error('Preprint SSO configuration is unavailable');
  }

  return {
    clientId: data.clientId,
    ssoApiUrl: browserSsoApiUrl(data.ssoApiUrl, origin),
    redirectUri: normalizeSsoRedirectUri(data.redirectUri, origin),
  };
}

export function randomString(bytes = 32) { return randomBytes(bytes).toString('base64url'); }
export function createCodeChallenge(verifier: string) { return createHash('sha256').update(verifier).digest('base64url'); }

