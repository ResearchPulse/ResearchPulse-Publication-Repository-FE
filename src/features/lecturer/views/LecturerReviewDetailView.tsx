'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, ErrorState, Field, LoadingState, Notice, PageHeader, Panel, StatusBadge, TextArea } from '@hyperdata/design-system';
import { ROUTES } from '@/app/router';
import { LecturerShell } from '../components';
import { lecturerReviewApi, type LecturerRecommendation, type LecturerReviewDetail } from '../api';

function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Size unavailable';
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function LecturerReviewDetailView({ publicationId }: { publicationId: string }) {
  const [detail, setDetail] = useState<LecturerReviewDetail | null>(null);
  const [comment, setComment] = useState('');
  const [recommendation, setRecommendation] = useState<LecturerRecommendation>('NEEDS_REVISION');
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
        const review = result.reviews[0];
        if (review) {
          setComment(review.comment || '');
          if (review.recommendation) setRecommendation(review.recommendation);
        }
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this manuscript.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [publicationId]);

  const currentVersion = useMemo(() => detail?.versions.find((version) => version.isCurrent) || detail?.versions[0], [detail]);
  const downloadUrl = detail?.publication.downloadUrl || currentVersion?.downloadUrl || undefined;
  const submitted = Boolean(detail?.reviews[0]?.submittedAt);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!comment.trim()) {
      setError('A review comment is required before submitting.');
      return;
    }
    setSaving(true);
    try {
      const review = await lecturerReviewApi.submit(publicationId, { comment: comment.trim(), recommendation });
      setDetail((current) => current ? { ...current, reviews: [review] } : current);
      setSuccess('Your recommendation has been submitted to the administrator.');
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
        eyebrow="Available manuscript"
        title={title}
        description={`${uploader} · ${currentVersion?.versionLabel || 'Current version'} · ${detail.publication.status}`}
      />
      <Notice tone="info" title="Recommendation only">
        You can submit review feedback and a recommendation. The administrator makes the final publication decision.
      </Notice>
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
              <div><dt>Authors</dt><dd>{detail.publication.authors?.map((author) => author.name).join(', ') || 'Author details unavailable'}</dd></div>
              <div><dt>Keywords</dt><dd>{detail.publication.keywords?.join(', ') || 'No keywords provided'}</dd></div>
            </dl>
          </Panel>
          <Panel className="lecturer-review-panel">
            <div className="lecturer-panel-heading"><div><span className="lecturer-panel-eyebrow">Academic review</span><h2>{submitted ? 'Update your review' : 'Submit your review'}</h2></div>{submitted ? <StatusBadge status="COMPLETED" /> : null}</div>
            <form className="lecturer-review-form" onSubmit={handleSubmit}>
              {error ? <div className="lecturer-form-error" role="alert">{error}</div> : null}
              {success ? <Notice tone="success">{success}</Notice> : null}
              <Field label="Comments" hint="Explain the main evidence behind your recommendation."><TextArea value={comment} onChange={(event) => setComment(event.target.value)} rows={7} placeholder="Write your feedback for the administrator..." disabled={saving} /></Field>
              <fieldset className="lecturer-recommendation"><legend>Recommendation</legend>
                {([['PUBLISH', 'Recommend publish', 'The manuscript is ready for the administrator to consider.'], ['NEEDS_REVISION', 'Needs revision', 'The student should address specific issues before the next round.'], ['REJECT', 'Recommend reject', 'The manuscript is not ready for publication in its current form.']] as const).map(([value, label, description]) => (
                  <label className={recommendation === value ? 'lecturer-recommendation__option lecturer-recommendation__option--active' : 'lecturer-recommendation__option'} key={value}>
                    <input type="radio" name="recommendation" value={value} checked={recommendation === value} onChange={() => setRecommendation(value)} disabled={saving} />
                    <span><strong>{label}</strong><small>{description}</small></span>
                  </label>
                ))}
              </fieldset>
              <Button type="submit" loading={saving}>{submitted ? 'Update review' : 'Submit review'}</Button>
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
