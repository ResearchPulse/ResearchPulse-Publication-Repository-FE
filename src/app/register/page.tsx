import { redirect } from 'next/navigation';

export default function RegisterPage() {
  const ssoWebUrl = (
    process.env.CENTRAL_SSO_PORTAL_URL ||
    'https://auth.hyperdatalab.org'
  ).trim();

  // Validate URL format
  let targetOrigin: string;
  try {
    const parsed = new URL(ssoWebUrl);
    targetOrigin = parsed.origin;
  } catch {
    targetOrigin = 'https://auth.hyperdatalab.org';
  }

  // Safe redirect to configured SSO registration page (ignores any untrusted query parameters)
  redirect(`${targetOrigin}/register`);
}
