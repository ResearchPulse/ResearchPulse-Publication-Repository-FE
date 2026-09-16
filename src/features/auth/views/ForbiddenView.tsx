import Link from 'next/link';
import { Button, Panel, PageHeader } from '@hyperdata/design-system';
import { ROUTES } from '@/app/router';

export function ForbiddenView() {
  return (
    <main className="content forbidden-page">
      <Panel className="section-panel">
        <PageHeader
          eyebrow="Access boundary"
          title="You do not have access to this workspace."
          description="Your SSO role is not allowed to open this route. Return to the public gateway or sign in with the appropriate account."
        />
        <div className="review-actions">
          <Link href={ROUTES.HOME}>
            <Button variant="secondary">Back to gateway</Button>
          </Link>
          <Link href={ROUTES.AUTH.LOGOUT}>
            <Button>Sign out</Button>
          </Link>
        </div>
      </Panel>
    </main>
  );
}

export default ForbiddenView;
