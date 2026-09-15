import Link from 'next/link';
import { Button, Panel } from '@hyperlabdata/ui';

export default function ForbiddenPage() {
  return <main className="content" style={{ maxWidth: 680 }}><Panel className="section-panel"><p className="eyebrow">Access boundary</p><h1>You do not have access to this workspace.</h1><p className="abstract">Your SSO role is not allowed to open this route. Return to the public gateway or sign in with the appropriate account.</p><div className="review-actions"><Link href="/"><Button variant="secondary">Back to gateway</Button></Link><Link href="/api/auth/logout"><Button>Sign out</Button></Link></div></Panel></main>;
}
