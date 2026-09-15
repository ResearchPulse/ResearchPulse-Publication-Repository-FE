import Link from 'next/link';
import { Button, Panel, PageHeader } from '@hyperdata/design-system';

export default function ForbiddenPage() {
  return <main className="content forbidden-page"><Panel className="section-panel"><PageHeader eyebrow="Access boundary" title="You do not have access to this workspace." description="Your SSO role is not allowed to open this route. Return to the public gateway or sign in with the appropriate account." /><div className="review-actions"><Link href="/"><Button variant="secondary">Back to gateway</Button></Link><Link href="/api/auth/logout"><Button>Sign out</Button></Link></div></Panel></main>;
}
