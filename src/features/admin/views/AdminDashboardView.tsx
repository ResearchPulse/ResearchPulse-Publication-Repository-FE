import Link from 'next/link';
import { Button, Panel, StatusBadge } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { ROUTES } from '@/app/router';

const metrics = [
  ['Submitted', '—', 'API pending'],
  ['Under review', '—', 'API pending'],
  ['Needs revision', '—', 'API pending'],
  ['Published', '—', 'API pending'],
];

function QueueItem({ title, description, status }: { title: string; description: string; status: string }) {
  return (
    <div className="queue-item">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

export function AdminDashboardView() {
  return (
    <AdminShell active="dashboard" title="Dashboard">
      <AdminPageHeader
        eyebrow="Preprint workspace"
        title="Review with confidence."
        description="One place for submission quality, reviewer decisions, and publication readiness."
        actions={
          <Link href={ROUTES.ADMIN.SUBMISSIONS}>
            <Button variant="primary">Open submission queue</Button>
          </Link>
        }
      />
      <div className="preview-note">
        Preview mode is active. Connect Preprint BE to replace placeholders with live counts and review queue data.
      </div>
      <div className="stat-grid">
        {metrics.map(([label, value, meta]) => (
          <div className="stat-card" key={label}>
            <div className="stat-card__label">{label}</div>
            <div className="stat-card__value">{value}</div>
            <div className="stat-card__meta">{meta}</div>
          </div>
        ))}
      </div>
      <div className="section-grid">
        <Panel className="section-panel">
          <h2 className="section-title">
            Priority queue <Link href={ROUTES.ADMIN.SUBMISSIONS}>View all</Link>
          </h2>
          <div className="queue-list">
            <QueueItem
              title="Submission queue will appear here"
              description="Connect the Admin API to load assigned papers."
              status="SUBMITTED"
            />
            <QueueItem
              title="Reviewer activity will appear here"
              description="Review history stays attached to each version."
              status="UNDER_REVIEW"
            />
          </div>
        </Panel>
        <Panel className="section-panel">
          <h2 className="section-title">Workflow</h2>
          <div className="timeline">
            <div className="timeline-item">
              <strong>Assign a reviewer</strong>
              <span>Send each submission to the right lecturer.</span>
            </div>
            <div className="timeline-item">
              <strong>Record a decision</strong>
              <span>Approve, request revision, or reject.</span>
            </div>
            <div className="timeline-item">
              <strong>Publish deliberately</strong>
              <span>Only approved papers can become public.</span>
            </div>
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}

export default AdminDashboardView;
