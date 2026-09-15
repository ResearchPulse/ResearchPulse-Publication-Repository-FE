import Link from 'next/link';
import { Button, EmptyState } from '@hyperlabdata/ui';
import { AdminSidebar, Topbar } from '../../components/admin-shell';

export default function ReviewsPage() { return <div className="admin-frame"><AdminSidebar active="reviews" /><main className="admin-main"><Topbar title="Reviews" /><div className="content"><div className="page-head"><div><p className="eyebrow">Reviewer workspace</p><h1>Reviews</h1><p>See assigned work and keep feedback close to the submitted version.</p></div><Link href="/submissions"><Button variant="secondary">Browse submissions</Button></Link></div><div className="preview-note">Review assignments will load after the Preprint BE assignment endpoint is connected.</div><div className="ui-panel"><EmptyState title="No live reviews yet" description="Connect the API to load assignments for the signed-in lecturer." /></div></div></main></div>; }
