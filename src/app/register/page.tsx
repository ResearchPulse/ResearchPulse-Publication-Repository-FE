import { redirect } from 'next/navigation';

export default function RegisterPage() {
  const ssoWebUrl = (
    process.env.SSO_WEB_URL ||
    process.env.NEXT_PUBLIC_SSO_WEB_URL ||
    'http://localhost:3000'
  ).trim();

  // Validate URL format
  let targetOrigin: string;
  try {
    const parsed = new URL(ssoWebUrl);
    targetOrigin = parsed.origin;
  } catch {
    targetOrigin = 'http://localhost:3000';
  }

  // Safe redirect to configured SSO registration page (ignores any untrusted query parameters)
  redirect(`${targetOrigin}/register`);
}
