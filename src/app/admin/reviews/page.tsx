import Link from 'next/link';
import { Button, EmptyState } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../../../components/admin-shell';

export default function ReviewsPage() { return <AdminShell active="reviews" title="Reviews">
  <AdminPageHeader eyebrow="Reviewer workspace" title="Reviews" description="See assigned work and keep feedback close to the submitted version." actions={<Link href="/admin/submissions"><Button variant="secondary">Browse submissions</Button></Link>} />
  <div className="preview-note">Review assignments will load after the Preprint BE assignment endpoint is connected.</div>
  <div className="ui-panel"><EmptyState title="No live reviews yet" description="Connect the API to load assignments for the signed-in lecturer." /></div>
</AdminShell>; }
