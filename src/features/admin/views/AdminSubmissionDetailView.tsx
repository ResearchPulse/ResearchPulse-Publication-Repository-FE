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

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Size unavailable';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function truncateHash(hash?: string | null) {
  if (!hash) return null;
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function fileNameFromObjectKey(objectKey?: string) {
  if (!objectKey) return undefined;
  return objectKey.split('/').pop() || objectKey;
}

function ReviewList({ reviews }: { reviews: AdminReview[] }) {
  if (!reviews.length) {
    return (
      <div className="preview-note" style={{ background: '#f8fafc', borderColor: '#e2e8f0', color: '#64748b' }}>
        No faculty mentor reviews have been submitted yet.
      </div>
    );
  }

  return (
    <div className="reviewer-card-list">
      {reviews.map((review) => {
        const isNeedsRevision = review.recommendation === 'NEEDS_REVISION';
        const isPublish = review.recommendation === 'PUBLISH';
        const initials = review.reviewer?.name
          ?.split(' ')
          .map((n) => n[0])
          .filter(Boolean)
          .slice(-2)
          .join('')
          .toUpperCase() || 'LR';

        return (
          <div
            className={`reviewer-card ${isNeedsRevision ? 'reviewer-card--revision' : isPublish ? 'reviewer-card--publish' : ''}`}
            key={review.id}
          >
            <div className="reviewer-card-top">
              <div className="reviewer-profile">
                <div className="reviewer-avatar-circle">{initials}</div>
                <div>
                  <h4 className="reviewer-name">{review.reviewer?.name || review.reviewer?.email || review.reviewerId}</h4>
                  <p className="reviewer-role">
                    Faculty Reviewer · {formatDate(review.submittedAt || review.updatedAt)}
                  </p>
                </div>
              </div>
              <div>
                {review.recommendation === 'NEEDS_REVISION' && (
                  <span className="user-badge user-badge--revision">NEEDS REVISION</span>
                )}
                {review.recommendation === 'PUBLISH' && (
                  <span className="user-badge user-badge--approved">RECOMMEND PUBLISH</span>
                )}
                {review.recommendation === 'REJECT' && (
                  <span className="user-badge user-badge--withdrawn">RECOMMEND REJECT</span>
                )}
                {!review.recommendation && (
                  <span className="user-badge user-badge--review">EVALUATION IN PROGRESS</span>
                )}
              </div>
            </div>
            {review.comment ? (
              <div className={`reviewer-comment-bubble ${isNeedsRevision ? 'reviewer-comment-bubble--alert' : ''}`}>
                &ldquo;{review.comment}&rdquo;
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>
                No written feedback comment attached.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function VersionList({ versions }: { versions: AdminVersion[] }) {
  if (!versions.length) {
    return <p style={{ color: '#64748b', fontSize: '13.5px' }}>No version history recorded.</p>;
  }

  return (
    <div className="version-card-list">
      {versions.map((version) => (
        <div className="version-card-item" key={version.id}>
          <div className="version-card-left">
            <span className={`version-pill ${version.isCurrent ? 'version-pill--current' : ''}`}>
              {version.versionLabel} {version.isCurrent ? '· Current' : '· Archived'}
            </span>
            <div>
              <h4 className="version-card-title">{version.fileName}</h4>
              <div className="version-card-meta">
                <span>{formatDate(version.createdAt)}</span>
                {version.fileSize && <span>· {formatFileSize(version.fileSize)}</span>}
                {version.sha256 && (
                  <span className="pdf-asset-hash" title={version.sha256}>
                    SHA: {truncateHash(version.sha256)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {version.downloadUrl && (
            <a
              href={version.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="student-btn student-btn--secondary student-btn--sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function TimelineList({ events }: { events: AdminTimelineEvent[] }) {
  if (!events.length) {
    return <p style={{ color: '#64748b', fontSize: '13.5px' }}>No audit timeline events logged.</p>;
  }

  return (
    <div className="audit-timeline-container">
      {events.map((event) => (
        <div className="audit-timeline-entry" key={event.id}>
          <div className="audit-timeline-node" />
          <div className="audit-timeline-header">
            <span className="audit-timeline-title">{event.title}</span>
            <span className="audit-timeline-actor">{event.actor}</span>
          </div>
          <p className="audit-timeline-desc">{event.description}</p>
          <span className="audit-timeline-time">{formatDate(event.timestamp)}</span>
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
    const actionLabel = status === 'PUBLISHED' ? 'publish' : status === 'DRAFTING' ? 'request revision for' : 'reject';
    if (!publication || !window.confirm(`Confirm action to ${actionLabel} this manuscript?`)) return;

    setBusy(true);
    setMessage(null);
    try {
      const updated = await adminApi.changeStatus(id, status);
      setPublication((current) => current ? { ...current, ...updated, status } : current);
      setMessage(`Manuscript successfully moved to ${status}.`);
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
        description="Read the manuscript record, inspect peer review evidence, and execute editorial decisions."
      />
      <Link className="back-link" href={ROUTES.ADMIN.SUBMISSIONS}>← Back to submissions</Link>

      {loading && <div className="preview-note" role="status">Loading manuscript record...</div>}
      {error && <div className="preview-note" role="alert">Unable to load manuscript: {error}</div>}
      {historyError && !error && <div className="preview-note" role="status">{historyError}</div>}

      {publication && (
        <div className="detail-grid">
          {/* Left Panel: Manuscript Record, Authors, Versions, Timeline */}
          <Panel className="detail-panel">
            <div className="manuscript-detail-header">
              <div>
                <p className="manuscript-meta-eyebrow">
                  {publication.currentVersion?.versionLabel || 'v1.0'} · Student Research
                </p>
                <h2 className="manuscript-detail-title">{publication.title || 'Untitled manuscript'}</h2>
              </div>
              <StatusBadge status={badgeStatus(publication.status)} />
            </div>

            {/* Abstract */}
            <div className="manuscript-abstract-box">
              <div className="manuscript-abstract-label">Abstract</div>
              <p className="manuscript-abstract-text">{publication.abstract || 'No abstract provided for this manuscript.'}</p>
            </div>

            {/* Primary PDF Asset */}
            {publication.downloadUrl && (
              <div className="pdf-asset-card">
                <div className="pdf-asset-info">
                  <div className="pdf-asset-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="pdf-asset-name">
                      {publication.currentVersion?.fileName || fileNameFromObjectKey(publication.objectKey) || 'Manuscript PDF'}
                    </h4>
                    <div className="pdf-asset-meta">
                      <span>{formatFileSize(publication.fileSize)}</span>
                      {publication.currentVersion?.versionLabel && (
                        <span>· Version {publication.currentVersion.versionLabel}</span>
                      )}
                    </div>
                  </div>
                </div>
                <a
                  href={publication.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="student-btn student-btn--primary student-btn--sm"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  <span>Download PDF</span>
                </a>
              </div>
            )}

            {/* Authors */}
            <h3>Contributing Authors</h3>
            <div className="authors-chip-grid">
              {publication.authors && publication.authors.length > 0 ? (
                publication.authors.map((author, idx) => (
                  <div className="author-chip" key={author.id || idx}>
                    <div className="author-chip-avatar">{author.name.charAt(0).toUpperCase()}</div>
                    <div className="author-chip-info">
                      <span className="author-chip-name">{author.name}</span>
                      {author.affiliation && <span className="author-chip-affil">{author.affiliation}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>No author data available.</p>
              )}
            </div>

            {/* Version History */}
            <h3>Version History</h3>
            <VersionList versions={versions} />

            {/* Audit Timeline */}
            <h3>Audit Timeline</h3>
            <TimelineList events={timeline} />
          </Panel>

          {/* Right Panel: Review Progress & Admin Decision */}
          <Panel className="detail-panel">
            <h2>Peer Review Progress</h2>
            <p className="abstract">
              Faculty mentor evaluations provide independent evidence to inform editorial decisions.
            </p>
            <ReviewList reviews={reviews} />

            <h3>Assign Lecturers</h3>
            <div className="review-form">
              {!lecturers.length && <p className="abstract">No active faculty lecturers are available.</p>}
              <div className="lecturer-select-list">
                {lecturers.map((lecturer) => {
                  const isSelected = selectedReviewers.includes(lecturer.id);
                  return (
                    <label
                      key={lecturer.id}
                      className={`lecturer-select-item ${isSelected ? 'lecturer-select-item--active' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="lecturer-select-checkbox"
                        checked={isSelected}
                        onChange={(event) =>
                          setSelectedReviewers((current) =>
                            event.target.checked
                              ? [...new Set([...current, lecturer.id])]
                              : current.filter((value) => value !== lecturer.id)
                          )
                        }
                      />
                      <div className="reviewer-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                        {(lecturer.name || lecturer.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="lecturer-select-info">
                        <span className="lecturer-select-name">{lecturer.name || lecturer.email}</span>
                        <span className="lecturer-select-email">{lecturer.email}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
              <Button variant="secondary" disabled={busy || !lecturers.length} onClick={assignReviewers}>
                Update Lecturer Assignments
              </Button>
            </div>

            {/* Administrator Decision Card */}
            <div className="admin-decision-card">
              <h4 className="admin-decision-title">Administrator Decision</h4>
              <p className="admin-decision-desc">
                As the administrator, you evaluate the peer review recommendations and determine the next lifecycle stage.
              </p>
              {publication.status === 'REVIEWING' && (
                <div className="admin-decision-buttons">
                  <button
                    type="button"
                    className="admin-btn-decision admin-btn-decision--publish"
                    disabled={busy}
                    onClick={() => changeStatus('PUBLISHED')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Publish Paper</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn-decision admin-btn-decision--revision"
                    disabled={busy}
                    onClick={() => changeStatus('DRAFTING')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Request Revision</span>
                  </button>
                  <button
                    type="button"
                    className="admin-btn-decision admin-btn-decision--reject"
                    disabled={busy}
                    onClick={() => changeStatus('REJECTED')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    <span>Reject Paper</span>
                  </button>
                </div>
              )}
              {publication.status === 'REJECTED' && (
                <div className="admin-decision-buttons">
                  <button
                    type="button"
                    className="admin-btn-decision admin-btn-decision--reopen"
                    disabled={busy}
                    onClick={() => changeStatus('DRAFTING')}
                  >
                    Reopen for Revision
                  </button>
                </div>
              )}
              {publication.status === 'DRAFTING' && (
                <p style={{ margin: 0, fontSize: '13px', color: '#d97706', fontWeight: 600 }}>
                  Manuscript is currently returned to the student for revision (DRAFTING).
                </p>
              )}
              {publication.status === 'PUBLISHED' && (
                <p style={{ margin: 0, fontSize: '13px', color: '#059669', fontWeight: 600 }}>
                  This manuscript is published and publicly accessible.
                </p>
              )}
              {message && <p className="preview-note" style={{ marginTop: '14px', marginBottom: 0 }} role="status">{message}</p>}
            </div>
          </Panel>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminSubmissionDetailView;
