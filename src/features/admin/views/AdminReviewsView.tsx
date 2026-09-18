'use client';

import Link from 'next/link';
import { Button, EmptyState } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { ROUTES } from '@/app/router';

export function AdminReviewsView() {
  return (
    <AdminShell active="reviews" title="Reviews">
      <AdminPageHeader
        eyebrow="Review oversight"
        title="Reviews"
        description="Review assignments and lecturer recommendations are shown on each submission record."
        actions={
          <Link href={ROUTES.ADMIN.SUBMISSIONS}>
            <Button variant="secondary">Browse submissions</Button>
          </Link>
        }
      />
      <div className="ui-panel">
        <EmptyState
          title="Open a submission to review progress"
          description="The Admin role can view all lecturer assignments and recommendations from the submission detail page."
        />
      </div>
    </AdminShell>
  );
}

export default AdminReviewsView;
