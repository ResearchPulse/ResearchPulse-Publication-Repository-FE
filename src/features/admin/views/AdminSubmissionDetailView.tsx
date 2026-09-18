'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Panel, StatusBadge } from '@hyperdata/design-system';
import { AdminShell, AdminPageHeader } from '../components';
import {
  adminApi,
  type AdminPublication,
  type AdminPublicationStatus,
  type AdminReview,
  type AdminTimelineEvent,
  type AdminUser,
  type AdminVersion,
} from '../api';
import type { PreprintStatus } from '@/shared/types';
import { ROUTES } from '@/app/router';

export interface AdminSubmissionDetailViewProps {
  id: string;
}

function badgeStatus(status: AdminPublicationStatus): PreprintStatus {
  switch (status) {
    case 'REVIEWING':
      return 'UNDER_REVIEW';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PROCESSING':
    case 'DRAFTING':
    default:
      return 'DRAFT';
  }
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

function recommendationLabel(value?: AdminReview['recommendation']) {
  if (!value) return 'Not submitted';
  if (value === 'NEEDS_REVISION') return 'Needs revision';
  if (value === 'PUBLISH') return 'Recommend publish';
  return 'Recommend reject';
}

function ReviewList({ reviews }: { reviews: AdminReview[] }) {
  if (!reviews.length) return <p className="abstract">No lecturer reviews have been assigned yet.</p>;

  return (
    <div className="timeline">
      {reviews.map((review) => (
        <div className="timeline-item" key={review.id}>
          <strong>{review.reviewer?.name || review.reviewer?.email || review.reviewerId}</strong>
          <span>{recommendationLabel(review.recommendation)} · {formatDate(review.submittedAt || review.updatedAt)}</span>
          {review.comment && <span>{review.comment}</span>}
        </div>
      ))}
    </div>
  );
}

function VersionList({ versions }: { versions: AdminVersion[] }) {
  if (!versions.length) return <p className="abstract">No version history is available.</p>;

  return (
    <div className="timeline">
      {versions.map((version) => (
        <div className="timeline-item" key={version.id}>
          <strong>{version.versionLabel} · {version.fileName}</strong>
          <span>{version.isCurrent ? 'Current version' : 'Archived version'} · {formatDate(version.createdAt)}</span>
          {version.sha256 && <span>SHA-256: {version.sha256}</span>}
          {version.downloadUrl && <a href={version.downloadUrl} target="_blank" rel="noreferrer">Open PDF</a>}
        </div>
      ))}
    </div>
  );
}

function TimelineList({ events }: { events: AdminTimelineEvent[] }) {
  if (!events.length) return <p className="abstract">No timeline events are available.</p>;

  return (
    <div className="timeline">
      {events.map((event) => (
        <div className="timeline-item" key={event.id}>
          <strong>{event.title}</strong>
          <span>{event.description} · {formatDate(event.timestamp)}</span>
          <span>{event.actor}</span>
        </div>
      ))}
    </div>
  );
}

export function AdminSubmissionDetailView({ id }: AdminSubmissionDetailViewProps) {
  const [publication, setPublication] = useState<AdminPublication | null>(null);
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [versions, setVersions] = useState<AdminVersion[]>([]);
  const [timeline, setTimeline] = useState<AdminTimelineEvent[]>([]);
  const [lecturers, setLecturers] = useState<AdminUser[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setHistoryError(null);

    Promise.allSettled([
      adminApi.getSubmission(id),
      adminApi.getReviews(id),
      adminApi.getVersions(id),
      adminApi.getTimeline(id),
      adminApi.listLecturers(),
    ]).then(([publicationResult, reviewsResult, versionsResult, timelineResult, lecturersResult]) => {
      if (!active) return;

      if (publicationResult.status === 'rejected') {
        setError(publicationResult.reason instanceof Error ? publicationResult.reason.message : 'Unable to load manuscript.');
      } else {
        setPublication(publicationResult.value);
      }

      const optionalFailures: string[] = [];
      if (reviewsResult.status === 'fulfilled') {
        setReviews(reviewsResult.value);
        setSelectedReviewers(reviewsResult.value.map((review) => review.reviewerId));
      } else {
        optionalFailures.push('reviews');
      }
      if (versionsResult.status === 'fulfilled') setVersions(versionsResult.value);
      else optionalFailures.push('versions');
      if (timelineResult.status === 'fulfilled') setTimeline(timelineResult.value);
      else optionalFailures.push('timeline');
      if (lecturersResult.status === 'fulfilled') setLecturers(lecturersResult.value.users);
      else optionalFailures.push('lecturer directory');

      if (optionalFailures.length) {
        setHistoryError(`Some panels are unavailable: ${optionalFailures.join(', ')}.`);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  const assignReviewers = async () => {
    if (!selectedReviewers.length) {
      setMessage('Select at least one active lecturer before assigning review.');
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const nextReviews = await adminApi.assignReviewers(id, selectedReviewers);
      setReviews(nextReviews);
      setMessage('Reviewers assigned successfully.');
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to assign reviewers.');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (status: 'PUBLISHED' | 'REJECTED' | 'DRAFTING') => {
    if (!publication || !window.confirm(`Confirm status change to ${status}?`)) return;

    setBusy(true);
    setMessage(null);
    try {
      const updated = await adminApi.changeStatus(id, status);
      setPublication((current) => current ? { ...current, ...updated, status } : current);
      setMessage(`Manuscript moved to ${status}.`);
    } catch (reason: unknown) {
      setMessage(reason instanceof Error ? reason.message : 'Unable to change manuscript status.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminShell active="submissions" title="Submission detail">
      <AdminPageHeader
        eyebrow="Editorial record"
        title={publication?.title || 'Submission detail'}
        description="Read the manuscript record, review evidence, and make the final workflow decision."
      />
      <Link className="back-link" href={ROUTES.ADMIN.SUBMISSIONS}>← Back to submissions</Link>

      {loading && <div className="preview-note" role="status">Loading manuscript record...</div>}
      {error && <div className="preview-note" role="alert">Unable to load manuscript: {error}</div>}
      {historyError && !error && <div className="preview-note" role="status">{historyError}</div>}

      {publication && (
        <div className="detail-grid">
          <Panel className="detail-panel">
            <div className="page-head">
              <div>
                <p className="eyebrow">{publication.currentVersion?.versionLabel || 'Current version'} · student research</p>
                <h2>{publication.title || 'Untitled manuscript'}</h2>
              </div>
              <StatusBadge status={badgeStatus(publication.status)} />
            </div>
            <p className="abstract">{publication.abstract || 'No abstract provided.'}</p>
            {publication.downloadUrl && (
              <p><a href={publication.downloadUrl} target="_blank" rel="noreferrer">Open manuscript PDF</a></p>
            )}
            <h3>Authors</h3>
            <p className="abstract">{publication.authors?.map((author) => author.name).join(', ') || 'No author data available.'}</p>
            <h3>Version history</h3>
            <VersionList versions={versions} />
            <h3>Audit timeline</h3>
            <TimelineList events={timeline} />
          </Panel>

          <Panel className="detail-panel">
            <h2>Review progress</h2>
            <p className="abstract">Lecturer recommendations are evidence for the administrator. They do not publish or reject the manuscript.</p>
            <ReviewList reviews={reviews} />

            <h3>Assign lecturers</h3>
            <div className="review-form">
              {!lecturers.length && <p className="abstract">No active lecturers are available.</p>}
              {lecturers.map((lecturer) => (
                <label className="ui-field" key={lecturer.id}>
                  <span>
                    <input
                      type="checkbox"
                      checked={selectedReviewers.includes(lecturer.id)}
                      onChange={(event) => setSelectedReviewers((current) => event.target.checked
                        ? [...new Set([...current, lecturer.id])]
                        : current.filter((value) => value !== lecturer.id))}
                    />{' '}
                    {lecturer.name || lecturer.email}
                  </span>
                </label>
              ))}
              <Button variant="secondary" disabled={busy || !lecturers.length} onClick={assignReviewers}>
                Assign selected lecturers
              </Button>
            </div>

            <h3>Administrator decision</h3>
            <p className="abstract">The administrator is the only role allowed to make the final publication decision.</p>
            {publication.status === 'REVIEWING' && (
              <div className="review-actions">
                <Button disabled={busy} onClick={() => changeStatus('PUBLISHED')}>Publish</Button>
                <Button variant="danger" disabled={busy} onClick={() => changeStatus('REJECTED')}>Reject</Button>
              </div>
            )}
            {publication.status === 'REJECTED' && (
              <Button variant="secondary" disabled={busy} onClick={() => changeStatus('DRAFTING')}>
                Reopen for revision
              </Button>
            )}
            {!['REVIEWING', 'REJECTED'].includes(publication.status) && (
              <p className="abstract">No administrator status action is available in the current lifecycle state.</p>
            )}
            {message && <p className="preview-note" role="status">{message}</p>}
          </Panel>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminSubmissionDetailView;
