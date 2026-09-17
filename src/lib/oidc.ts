// Central SSO methods removed.
// Only backend API proxy URL remains.

export function preprintApiBaseUrl() {
  return process.env.PREPRINT_API_BASE_URL ?? process.env.NEXT_PUBLIC_PREPRINT_API_BASE_URL ?? 'http://localhost:3002';
}
