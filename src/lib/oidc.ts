import { createHash, randomBytes } from 'node:crypto';

const baseUrl = () => process.env.SSO_BASE_URL ?? process.env.SSO_API_BASE_URL ?? 'http://localhost:3001';

export function oidcConfig() {
  const base = baseUrl();
  return { authorize: `${base}/api/v1/oidc/authorize`, token: `${base}/api/v1/oidc/token`, userinfo: `${base}/api/v1/oidc/userinfo`, logout: `${base}/api/v1/auth/logout` };
}

export function randomString(bytes = 32) { return randomBytes(bytes).toString('base64url'); }
export function createCodeChallenge(verifier: string) { return createHash('sha256').update(verifier).digest('base64url'); }
