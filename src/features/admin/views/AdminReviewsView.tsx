import Link from 'next/link';
import { Button, EmptyState } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { ROUTES } from '@/app/router';

export function AdminReviewsView() {
  return (
    <AdminShell active="reviews" title="Reviews">
      <AdminPageHeader
        eyebrow="Reviewer workspace"
        title="Reviews"
        description="See assigned work and keep feedback close to the submitted version."
        actions={
          <Link href={ROUTES.ADMIN.SUBMISSIONS}>
            <Button variant="secondary">Browse submissions</Button>
          </Link>
        }
      />
      <div className="preview-note">
        Review assignments will load after the Preprint BE assignment endpoint is connected.
      </div>
      <div className="ui-panel">
        <EmptyState
          title="No live reviews yet"
          description="Connect the API to load assignments for the signed-in lecturer."
        />
      </div>
    </AdminShell>
  );
}

export default AdminReviewsView;
