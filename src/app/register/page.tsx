import { redirect } from 'next/navigation';

export default function RegisterPage() {
  const configuredUrl = (process.env.CENTRAL_SSO_PORTAL_URL || 'https://auth.hyperdatalab.org').trim();
  let origin = 'https://auth.hyperdatalab.org';
  try { origin = new URL(configuredUrl).origin; } catch { /* use safe default */ }
  redirect(`${origin}/register`);
}
