'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, ErrorState, Field, LoadingState, Notice, PageHeader, Panel, StatusBadge, TextArea } from '@hyperdata/design-system';
import { ROUTES } from '@/app/router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LecturerShell } from '../components';
import { lecturerReviewApi, type LecturerRecommendation, type LecturerReviewDetail } from '../api';

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Size unavailable';
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  // Filter submitted secondary peer reviews (visible to Primary Lecturer)
  const secondaryReviews = useMemo(() => {
    if (!detail?.reviews) return [];
    return detail.reviews.filter((r) => r.id !== myReview?.id && r.assignmentRole === 'SECONDARY' && r.submittedAt);
  }, [detail, myReview?.id]);

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
            ? 'Manuscript returned to student author for revision (DRAFTING).'
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

  if (loading) return <LecturerShell active="reviews" title="Review manuscript"><LoadingState label="Loading manuscript" /></LecturerShell>;
  if (error && !detail) return <LecturerShell active="reviews" title="Review manuscript"><ErrorState title="Manuscript unavailable" description={error} action={<Link href={ROUTES.LECTURER.REVIEWS}><Button variant="secondary">Back to queue</Button></Link>} /></LecturerShell>;
  if (!detail) return null;

  const title = detail.publication.title?.trim() || currentVersion?.fileName || 'Untitled manuscript';
  const uploader = detail.publication.uploader?.name || detail.publication.uploader?.email || 'Student author unavailable';

  return (
    <LecturerShell active="reviews" title="Review manuscript">
      <Link className="lecturer-back-link" href={ROUTES.LECTURER.REVIEWS}>← Back to review queue</Link>
      <PageHeader
        eyebrow={isPrimary ? 'Primary Lecturer Review (Chuyên môn chính)' : 'Secondary Peer Review (Phản biện độc lập)'}
        title={title}
        description={`${uploader} · ${currentVersion?.versionLabel || 'Current version'} · ${detail.publication.status}`}
      />
      {isPrimary ? (
        <Notice tone="info" title="Primary Academic Authority (Giảng viên chính)">
          You are the assigned Primary Lecturer for this round. You have full academic authority to evaluate peer reviews and finalize the publication decision (Publish, Return to Drafting, or Reject).
        </Notice>
      ) : (
        <Notice tone="info" title="Independent Peer Reviewer (Giảng viên phụ)">
          You are assigned as a Secondary Reviewer for this round. Please provide your independent academic evaluation and recommendation. Your findings assist the Primary Lecturer in finalizing the lifecycle decision.
        </Notice>
      )}
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
              <div><dt>Student</dt><dd>{uploader}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge status={detail.publication.status} /></dd></div>
              <div><dt>Role</dt><dd><strong>{isPrimary ? 'Primary Lecturer (Lead)' : isSecondary ? 'Secondary Reviewer' : 'Reviewer'}</strong></dd></div>
              <div><dt>Authors</dt><dd>{detail.publication.authors?.map((author) => author.name).join(', ') || 'Author details unavailable'}</dd></div>
              <div><dt>Keywords</dt><dd>{detail.publication.keywords?.join(', ') || 'No keywords provided'}</dd></div>
            </dl>
          </Panel>

          {/* Secondary Reviewers Feedback (visible only to Primary Lecturer) */}
          {isPrimary && (
            <Panel className="lecturer-secondary-panel">
              <div className="lecturer-panel-heading">
                <div>
                  <span className="lecturer-panel-eyebrow">Peer Review Evidence</span>
                  <h2>Secondary Reviewers ({secondaryReviews.length}/2 submitted)</h2>
                </div>
              </div>
              {secondaryReviews.length === 0 ? (
                <p className="lecturer-muted" style={{ fontStyle: 'italic', margin: 0 }}>
                  Secondary reviewers have not submitted their evaluations yet. You may still proceed with your workflow decision at any time.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {secondaryReviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '12px 14px',
                        border: '1px solid var(--hd-line)',
                        borderRadius: '8px',
                        background: '#f8fafc',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                        <div>
                          <strong style={{ fontSize: '13px', color: 'var(--hd-ink)' }}>
                            {rev.reviewer?.name || rev.reviewer?.email || 'Secondary Reviewer'}
                          </strong>
                          {rev.submittedAt && (
                            <span style={{ fontSize: '11.5px', color: 'var(--hd-muted)', marginLeft: '8px' }}>
                              {new Date(rev.submittedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div>
                          {rev.recommendation === 'PUBLISH' && <StatusBadge status="PUBLISHED" />}
                          {rev.recommendation === 'NEEDS_REVISION' && <StatusBadge status="NEEDS_REVISION" />}
                          {rev.recommendation === 'REJECT' && <StatusBadge status="REJECTED" />}
                        </div>
                      </div>
                      {rev.comment ? (
                        <div style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--hd-ink)', whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
                          &ldquo;{rev.comment}&rdquo;
                        </div>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--hd-muted)', margin: 0, fontStyle: 'italic' }}>
                          No detailed comments provided.
                        </p>
                      )}
                    </div>
                  ))}
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
              <Field
                label={isPrimary ? 'Evaluation & requirements' : 'Comments'}
                hint={
                  isPrimary
                    ? 'Explain the academic evaluation and requirements for the author. This is recorded as the decision rationale.'
                    : 'Explain the main academic evidence behind your recommendation.'
                }
              >
                <TextArea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={6}
                  placeholder={
                    isPrimary
                      ? 'Write your academic evaluation and specific requirements for the author...'
                      : 'Write your academic evaluation and specific feedback for this manuscript...'
                  }
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                />
              </Field>

              {isPrimary ? (
                <fieldset className="lecturer-recommendation">
                  <legend>Workflow Decision</legend>
                  {([
                    ['PUBLISHED', 'Publish paper', 'The manuscript meets academic standards and is approved for publication.'],
                    ['DRAFTING', 'Return to drafting (Needs revision)', 'The student author must address the issues specified in the comments above before the next round.'],
                    ['REJECTED', 'Reject paper', 'The manuscript is rejected and not eligible for publication.']
                  ] as const).map(([value, label, description]) => (
                    <label
                      className={primaryDecision === value ? 'lecturer-recommendation__option lecturer-recommendation__option--active' : 'lecturer-recommendation__option'}
                      key={value}
                    >
                      <input
                        type="radio"
                        name="primaryDecision"
                        value={value}
                        checked={primaryDecision === value}
                        onChange={() => setPrimaryDecision(value)}
                        disabled={saving || detail.publication.status !== 'REVIEWING'}
                      />
                      <span><strong>{label}</strong><small>{description}</small></span>
                    </label>
                  ))}
                </fieldset>
              ) : (
                <fieldset className="lecturer-recommendation">
                  <legend>Recommendation</legend>
                  {([
                    ['PUBLISH', 'Recommend publish', 'Recommend publication to the Primary Lecturer.'],
                    ['NEEDS_REVISION', 'Needs revision', 'The student author should address specific issues before the next round.'],
                    ['REJECT', 'Recommend reject', 'The manuscript is not ready for publication in its current form.']
                  ] as const).map(([value, label, description]) => (
                    <label
                      className={recommendation === value ? 'lecturer-recommendation__option lecturer-recommendation__option--active' : 'lecturer-recommendation__option'}
                      key={value}
                    >
                      <input
                        type="radio"
                        name="recommendation"
                        value={value}
                        checked={recommendation === value}
                        onChange={() => setRecommendation(value)}
                        disabled={saving || detail.publication.status !== 'REVIEWING'}
                      />
                      <span><strong>{label}</strong><small>{description}</small></span>
                    </label>
                  ))}
                </fieldset>
              )}

              {isPrimary ? (
                detail.publication.status === 'REVIEWING' ? (
                  <Button type="submit" loading={saving}>Submit decision</Button>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid var(--hd-line)', borderRadius: '6px', fontSize: '13px', color: 'var(--hd-muted)' }}>
                    Workflow decision finalized as <strong>{detail.publication.status}</strong>.
                  </div>
                )
              ) : (
                detail.publication.status === 'REVIEWING' ? (
                  <Button type="submit" loading={saving}>{submitted ? 'Update review' : 'Submit review'}</Button>
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
      <Panel className="lecturer-history-panel">
        <div className="lecturer-panel-heading"><div><span className="lecturer-panel-eyebrow">Provenance</span><h2>Version and timeline</h2></div></div>
        <div className="lecturer-history-grid"><div><h3>Versions</h3>{detail.versions.length ? detail.versions.map((version) => <div className="lecturer-history-row" key={version.id}><strong>{version.versionLabel}</strong><span>{version.fileName}{version.isCurrent ? ' · current' : ' · archived'}</span></div>) : <p className="lecturer-muted">No version history available.</p>}</div><div><h3>Timeline</h3>{detail.timeline.length ? detail.timeline.slice(-5).reverse().map((event) => <div className="lecturer-history-row" key={event.id}><strong>{event.title}</strong><span>{event.description}</span></div>) : <p className="lecturer-muted">No timeline events available.</p>}</div></div>
      </Panel>
    </LecturerShell>
  );
}

export default LecturerReviewDetailView;
