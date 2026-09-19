'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, ErrorState, Field, Notice, PageHeader, Panel, StatusBadge, TextArea } from '@hyperdata/design-system';
import { ROUTES } from '@/app/router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LecturerShell } from '../components';
import { DetailSkeleton } from '@/components/skeleton';
import { lecturerReviewApi, type LecturerRecommendation, type LecturerReviewDetail } from '../api';

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Size unavailable';
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : '—';
}

function ReviewCommentItem({ comment }: { comment: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.length > 120 || comment.includes('\n');

  return (
    <div className="simple-reviewer-item__comment-wrapper">
      <div className={`simple-reviewer-item__comment ${isLong && !expanded ? 'simple-reviewer-item__comment--clamped' : ''}`}>
        &ldquo;{comment}&rdquo;
      </div>
      {isLong && (
        <button
          type="button"
          className="simple-reviewer-item__toggle-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less ▴' : 'Show more ▾'}
        </button>
      )}
    </div>
  );
}

export function LecturerReviewDetailView({ publicationId }: { publicationId: string }) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<LecturerReviewDetail | null>(null);
  const [comment, setComment] = useState('');
  const [recommendation, setRecommendation] = useState<LecturerRecommendation>('NEEDS_REVISION');
  const [primaryDecision, setPrimaryDecision] = useState<'PUBLISHED' | 'DRAFTING' | 'REJECTED'>('DRAFTING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    lecturerReviewApi.get(publicationId)
      .then((result) => {
        if (!active) return;
        setDetail(result);
        const review = user?.id
          ? result.reviews.find((r) => r.reviewerId === user.id) || result.reviews[0]
          : result.reviews[0];
        if (review) {
          setComment(review.comment || '');
          if (review.recommendation) {
            setRecommendation(review.recommendation);
            if (review.recommendation === 'PUBLISH') setPrimaryDecision('PUBLISHED');
            else if (review.recommendation === 'REJECT') setPrimaryDecision('REJECTED');
            else setPrimaryDecision('DRAFTING');
          }
        }
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this manuscript.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [publicationId, user?.id]);

  const currentVersion = useMemo(() => detail?.versions.find((version) => version.isCurrent) || detail?.versions[0], [detail]);
  const downloadUrl = detail?.publication.downloadUrl || currentVersion?.downloadUrl || undefined;

  // Identify current user's review assignment
  const myReview = useMemo(() => {
    if (!detail?.reviews.length) return null;
    if (user?.id) {
      return detail.reviews.find((r) => r.reviewerId === user.id) || detail.reviews[0];
    }
    return detail.reviews[0];
  }, [detail, user?.id]);

  const isPrimary = myReview?.assignmentRole === 'PRIMARY';
  const isSecondary = myReview?.assignmentRole === 'SECONDARY';
  const submitted = Boolean(myReview?.submittedAt);

  // Filter all secondary peer reviews (visible to Primary Lecturer)
  const secondaryReviews = useMemo(() => {
    if (!detail?.reviews) return [];
    return detail.reviews.filter((r) => r.id !== myReview?.id && r.assignmentRole === 'SECONDARY');
  }, [detail, myReview?.id]);

  const secondarySubmittedCount = useMemo(() => {
    return secondaryReviews.filter((r) => Boolean(r.submittedAt || r.recommendation)).length;
  }, [secondaryReviews]);

  // Sync review data if myReview resolves after initial load
  useEffect(() => {
    if (myReview) {
      setComment(myReview.comment || '');
      if (myReview.recommendation) {
        setRecommendation(myReview.recommendation);
        if (myReview.recommendation === 'PUBLISH') setPrimaryDecision('PUBLISHED');
        else if (myReview.recommendation === 'REJECT') setPrimaryDecision('REJECTED');
        else setPrimaryDecision('DRAFTING');
      }
    }
  }, [myReview?.id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!comment.trim()) {
      setError('Please provide your academic evaluation comments before submitting.');
      return;
    }
    setSaving(true);
    try {
      if (isPrimary) {
        const mappedRecommendation: LecturerRecommendation =
          primaryDecision === 'PUBLISHED' ? 'PUBLISH' : primaryDecision === 'REJECTED' ? 'REJECT' : 'NEEDS_REVISION';

        // 1. Submit review to save comments into database
        const review = await lecturerReviewApi.submit(publicationId, {
          comment: comment.trim(),
          recommendation: mappedRecommendation,
        });

        // 2. Change workflow status with comment as reason
        await lecturerReviewApi.changeStatus(publicationId, primaryDecision, comment.trim());

        setDetail((current) => {
          if (!current) return current;
          const exists = current.reviews.some((r) => r.id === review.id || r.reviewerId === review.reviewerId);
          const updatedReviews = exists
            ? current.reviews.map((r) => (r.id === review.id || r.reviewerId === review.reviewerId ? review : r))
            : [review, ...current.reviews];
          return {
            ...current,
            publication: { ...current.publication, status: primaryDecision },
            reviews: updatedReviews,
          };
        });

        setSuccess(
          primaryDecision === 'PUBLISHED'
            ? 'Manuscript published successfully!'
            : primaryDecision === 'DRAFTING'
            ? 'Manuscript returned to author for revision (DRAFTING).'
            : 'Manuscript rejected.'
        );
      } else {
        const review = await lecturerReviewApi.submit(publicationId, { comment: comment.trim(), recommendation });
        setDetail((current) => {
          if (!current) return current;
          const exists = current.reviews.some((r) => r.id === review.id || r.reviewerId === review.reviewerId);
          const updatedReviews = exists
            ? current.reviews.map((r) => (r.id === review.id || r.reviewerId === review.reviewerId ? review : r))
            : [review, ...current.reviews];
          return { ...current, reviews: updatedReviews };
        });
        setSuccess('Your evaluation and recommendation have been submitted to the lead reviewer (Primary Lecturer).');
      }
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : 'Unable to submit your review.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LecturerShell active="reviews" title="Review manuscript"><DetailSkeleton /></LecturerShell>;
  if (error && !detail) return <LecturerShell active="reviews" title="Review manuscript"><ErrorState title="Manuscript unavailable" description={error} action={<Link href={ROUTES.LECTURER.REVIEWS}><Button variant="secondary">Back to queue</Button></Link>} /></LecturerShell>;
  if (!detail) return null;

  const title = detail.publication.title?.trim() || currentVersion?.fileName || 'Untitled manuscript';
  const isFaculty = detail.publication.uploader?.role === 'LECTURER';
  const uploader = detail.publication.uploader?.name || (isFaculty ? 'Anonymous Author' : 'Student Author');

  return (
    <LecturerShell active="reviews" title="Review manuscript">
      <div className="admin-detail-top-nav">
        <Link className="admin-back-btn" href={ROUTES.LECTURER.REVIEWS}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to review queue</span>
        </Link>
      </div>
      <PageHeader
        title={title}
      />
      <div className="lecturer-detail-grid">
        <Panel className="lecturer-pdf-panel">
          <div className="lecturer-panel-heading"><div><span className="lecturer-panel-eyebrow">Manuscript PDF</span><h2>{currentVersion?.fileName || 'Current PDF'}</h2></div>{downloadUrl ? <a className="ui-button ui-button--secondary" href={downloadUrl} target="_blank" rel="noreferrer">Open PDF</a> : null}</div>
          {downloadUrl ? <iframe className="lecturer-pdf-viewer" src={downloadUrl} title={`PDF preview for ${title}`} /> : <div className="lecturer-pdf-empty">PDF preview is not available for this manuscript.</div>}
          <div className="lecturer-file-meta"><span>{formatFileSize(currentVersion?.fileSize ?? detail.publication.fileSize)}</span><span>{currentVersion?.sha256 ? `SHA-256 ${currentVersion.sha256.slice(0, 12)}…` : 'Hash unavailable'}</span></div>
        </Panel>
        <div className="lecturer-detail-side">
          <Panel className="lecturer-metadata-panel">
            <span className="lecturer-panel-eyebrow">Manuscript information</span>
            <dl className="lecturer-metadata-list">
              <div>
                <dt>Author</dt>
                <dd>
                  {uploader}{' '}
                  {isFaculty ? (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>(Double-Blind)</span>
                  ) : detail.publication.uploader?.email ? (
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>({detail.publication.uploader.email})</span>
                  ) : null}
                </dd>
              </div>
              <div><dt>Status</dt><dd><StatusBadge status={detail.publication.status} /></dd></div>
              <div><dt>Role</dt><dd><strong>{isPrimary ? 'Primary Lecturer (Lead)' : isSecondary ? 'Secondary Reviewer' : 'Reviewer'}</strong></dd></div>
              <div>
                <dt>Authors</dt>
                <dd>
                  {detail.publication.authors && detail.publication.authors.length > 0
                    ? detail.publication.authors.map((author) => author.name).join(', ')
                    : isFaculty
                    ? 'Anonymous Author (Double-Blind Review)'
                    : uploader}
                </dd>
              </div>
              <div><dt>Keywords</dt><dd>{detail.publication.keywords?.join(', ') || 'No keywords provided'}</dd></div>
            </dl>
          </Panel>

          {/* Secondary Reviewers Feedback (visible only to Primary Lecturer) */}
          {isPrimary && (
            <Panel className="lecturer-secondary-panel">
              <div className="lecturer-panel-heading" style={{ marginBottom: '8px' }}>
                <div>
                  <span className="lecturer-panel-eyebrow">Peer Review Evidence</span>
                  <h2>Secondary Reviewers ({secondarySubmittedCount}/{secondaryReviews.length || 2} submitted)</h2>
                </div>
              </div>
              {secondaryReviews.length === 0 ? (
                <p className="lecturer-muted" style={{ fontStyle: 'italic', margin: 0 }}>
                  Secondary reviewers have not been assigned yet.
                </p>
              ) : (
                <div className="simple-reviewer-list" style={{ borderTop: '1px solid #f1f5f9', marginTop: '6px', marginBottom: 0 }}>
                  {secondaryReviews.map((rev) => {
                    const isNeedsRevision = rev.recommendation === 'NEEDS_REVISION';
                    const isPublish = rev.recommendation === 'PUBLISH';
                    const isReject = rev.recommendation === 'REJECT';
                    const initials =
                      rev.reviewer?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(-2)
                        .join('')
                        .toUpperCase() || 'SR';

                    return (
                      <div className="simple-reviewer-item" key={rev.id}>
                        <div className="simple-reviewer-item__main">
                          <div className="simple-reviewer-item__left">
                            <div className="simple-reviewer-item__avatar">{initials}</div>
                            <div className="simple-reviewer-item__info">
                              <div className="simple-reviewer-item__name-line">
                                <span className="simple-reviewer-item__name">
                                  {rev.reviewer?.name || rev.reviewer?.email || rev.reviewerId}
                                </span>
                                <span className="simple-reviewer-item__role-tag simple-reviewer-item__role-tag--secondary">
                                  Secondary
                                </span>
                              </div>
                              <p className="simple-reviewer-item__sub">
                                Independent Reviewer · {formatDate(rev.submittedAt || rev.updatedAt || rev.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="simple-reviewer-item__badge">
                            {isNeedsRevision && (
                              <span className="user-badge user-badge--revision" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                Needs Revision
                              </span>
                            )}
                            {isPublish && (
                              <span className="user-badge user-badge--approved" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                Recommend Publish
                              </span>
                            )}
                            {isReject && (
                              <span className="user-badge user-badge--withdrawn" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                Recommend Reject
                              </span>
                            )}
                            {!rev.recommendation && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#94a3b8',
                                  background: '#f8fafc',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #e2e8f0',
                                }}
                              >
                                Pending
                              </span>
                            )}
                          </div>
                        </div>

                        {rev.comment && <ReviewCommentItem comment={rev.comment} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          )}

          {/* Unified Evaluation & Decision Panel (matching UI of Hình 1) */}
          <Panel className="lecturer-review-panel">
            <div className="lecturer-panel-heading">
              <div>
                <span className="lecturer-panel-eyebrow">
                  {isPrimary ? 'Lead academic evaluation' : 'Independent evaluation'}
                </span>
                <h2>
                  {isPrimary
                    ? 'Academic evaluation & decision'
                    : submitted
                    ? 'Update your review'
                    : 'Submit your review'}
                </h2>
              </div>
              <StatusBadge
                status={
                  detail.publication.status === 'REVIEWING'
                    ? submitted
                      ? 'COMPLETED'
                      : 'UNDER_REVIEW'
                    : detail.publication.status === 'PUBLISHED'
                    ? 'PUBLISHED'
                    : detail.publication.status === 'REJECTED'
                    ? 'REJECTED'
                    : 'DRAFT'
                }
              />
            </div>
            <form className="lecturer-review-form" onSubmit={handleSubmit}>
              {error ? <div className="lecturer-form-error" role="alert">{error}</div> : null}
              {success ? <Notice tone="success">{success}</Notice> : null}

              {/* Segmented Decision Pill Group (System Style) */}
              <div className="segmented-pill-group" role="radiogroup" aria-label="Decision">
                <button
                  type="button"
                  role="radio"
                  aria-checked={isPrimary ? primaryDecision === 'PUBLISHED' : recommendation === 'PUBLISH'}
                  className={`segmented-pill-btn ${(isPrimary ? primaryDecision === 'PUBLISHED' : recommendation === 'PUBLISH') ? 'segmented-pill-btn--active' : ''}`}
                  onClick={() => (isPrimary ? setPrimaryDecision('PUBLISHED') : setRecommendation('PUBLISH'))}
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                >
                  Publish
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isPrimary ? primaryDecision === 'DRAFTING' : recommendation === 'NEEDS_REVISION'}
                  className={`segmented-pill-btn ${(isPrimary ? primaryDecision === 'DRAFTING' : recommendation === 'NEEDS_REVISION') ? 'segmented-pill-btn--active' : ''}`}
                  onClick={() => (isPrimary ? setPrimaryDecision('DRAFTING') : setRecommendation('NEEDS_REVISION'))}
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                >
                  Revision
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isPrimary ? primaryDecision === 'REJECTED' : recommendation === 'REJECT'}
                  className={`segmented-pill-btn ${(isPrimary ? primaryDecision === 'REJECTED' : recommendation === 'REJECT') ? 'segmented-pill-btn--active' : ''}`}
                  onClick={() => (isPrimary ? setPrimaryDecision('REJECTED') : setRecommendation('REJECT'))}
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                >
                  Reject
                </button>
              </div>

              <Field label={isPrimary ? 'Evaluation & requirements' : 'Comments'}>
                <TextArea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={6}
                  placeholder="Enter your evaluation comments..."
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                />
              </Field>

              {isPrimary ? (
                detail.publication.status === 'REVIEWING' ? (
                  <Button type="submit" loading={saving} style={{ width: '100%' }}>
                    Submit
                  </Button>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid var(--hd-line)', borderRadius: '6px', fontSize: '13px', color: 'var(--hd-muted)' }}>
                    Workflow decision finalized as <strong>{detail.publication.status}</strong>.
                  </div>
                )
              ) : (
                detail.publication.status === 'REVIEWING' ? (
                  <Button type="submit" loading={saving} style={{ width: '100%' }}>
                    Submit
                  </Button>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid var(--hd-line)', borderRadius: '6px', fontSize: '13px', color: 'var(--hd-muted)' }}>
                    Review period is closed for this round.
                  </div>
                )
              )}
            </form>
          </Panel>
        </div>
      </div>
    </LecturerShell>
  );
}

export default LecturerReviewDetailView;
