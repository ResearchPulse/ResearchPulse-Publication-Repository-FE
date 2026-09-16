import { createHash, randomBytes } from 'node:crypto';

const baseUrl = () => process.env.CENTRAL_SSO_API_URL ?? 'https://auth-api.hyperdatalab.org';

export function oidcConfig() {
  const base = baseUrl();
  return { authorize: `${base}/api/v1/oidc/authorize`, token: `${base}/api/v1/oidc/token`, userinfo: `${base}/api/v1/oidc/userinfo`, logout: `${base}/api/v1/auth/logout` };
}

export function preprintApiBaseUrl() {
  return process.env.PREPRINT_API_BASE_URL ?? process.env.NEXT_PUBLIC_PREPRINT_API_BASE_URL ?? 'http://localhost:3002';
}

export function ssoClientId() {
  return process.env.SSO_CLIENT_ID ?? 'researchpulse-ecosystem';
}

export function ssoRedirectUri(origin: string) {
  return process.env.SSO_REDIRECT_URI ?? origin + '/auth/callback';
}

export function randomString(bytes = 32) { return randomBytes(bytes).toString('base64url'); }
export function createCodeChallenge(verifier: string) { return createHash('sha256').update(verifier).digest('base64url'); }
