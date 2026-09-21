'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, ErrorState, Field, Notice, PageHeader, Panel, StatusBadge, TextArea } from '@hyperdata/design-system';
import { ROUTES } from '@/app/router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LecturerShell } from '../components';
import { DetailSkeleton } from '@/components/skeleton';
import { lecturerReviewApi, type LecturerRecommendation, type LecturerReviewDetail } from '../api';
import { useTranslation } from '@/i18n';

const NativePdfViewer = dynamic(
  () => import('../../preprint/components/NativePdfViewer').then((mod) => mod.NativePdfViewer),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '400px' }}>
        <div className="student-spinner" />
      </div>
    ),
  },
);


function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return 'Size unavailable';
  return bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ReviewAuthorsList({
  authors,
  fallback,
}: {
  authors?: { name: string }[];
  fallback: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!authors || authors.length === 0) {
    return <span>{fallback}</span>;
  }

  if (authors.length <= 3) {
    return <span>{authors.map((a) => a.name).join(', ')}</span>;
  }

  const visible = expanded ? authors : authors.slice(0, 3);
  const remaining = authors.length - 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span>
        {visible.map((a) => a.name).join(', ')}
        {!expanded && ` …`}
      </span>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 0',
          color: '#64748b',
          fontSize: '11.5px',
          fontWeight: 500,
          cursor: 'pointer',
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span>{expanded ? 'Hide details' : 'Show details'}</span>
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
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
  const { t, locale } = useTranslation();
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

  if (loading) return <LecturerShell active="reviews" title={locale === 'vi' ? 'Thẩm định bản thảo' : 'Review manuscript'}><DetailSkeleton /></LecturerShell>;
  if (error && !detail) return <LecturerShell active="reviews" title={locale === 'vi' ? 'Thẩm định bản thảo' : 'Review manuscript'}><ErrorState title={locale === 'vi' ? 'Không thể mở bản thảo' : 'Manuscript unavailable'} description={error} action={<Link href={ROUTES.LECTURER.REVIEWS}><Button variant="secondary">{locale === 'vi' ? 'Quay lại hàng đợi' : 'Back to queue'}</Button></Link>} /></LecturerShell>;
  if (!detail) return null;

  const title = detail.publication.title?.trim() || currentVersion?.fileName || (locale === 'vi' ? 'Bản thảo chưa đặt tên' : 'Untitled manuscript');
  const isFaculty = detail.publication.uploader?.role === 'LECTURER';
  const uploader = detail.publication.uploader?.name || (isFaculty ? (locale === 'vi' ? 'Tác giả ẩn danh' : 'Anonymous Author') : (locale === 'vi' ? 'Tác giả sinh viên' : 'Student Author'));

  return (
    <LecturerShell active="reviews" title={locale === 'vi' ? 'Thẩm định bản thảo' : 'Review manuscript'}>
      <div className="admin-detail-top-nav">
        <Link className="admin-back-btn" href={ROUTES.LECTURER.REVIEWS}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>{locale === 'vi' ? 'Quay lại danh sách chờ duyệt' : 'Back to review queue'}</span>
        </Link>
      </div>
      <PageHeader
        title={title}
      />
      <div className="lecturer-detail-grid">
        <div className="lecturer-pdf-container">
          {downloadUrl ? (
            <NativePdfViewer
              url={downloadUrl}
              fileName={currentVersion?.fileName || 'manuscript.pdf'}
            />
          ) : (
            <div className="lecturer-pdf-empty">
              {locale === 'vi' ? 'Bản thảo này hiện chưa có bản xem trước PDF.' : 'PDF preview is not available for this manuscript.'}
            </div>
          )}
          <div className="lecturer-file-meta" style={{ marginTop: '16px', padding: '16px 24px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12.5px' }}>
            <span>{formatFileSize(currentVersion?.fileSize ?? detail.publication.fileSize)}</span>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
              {currentVersion?.sha256 ? `SHA-256: ${currentVersion.sha256}` : (locale === 'vi' ? 'Mã băm không khả dụng' : 'Hash unavailable')}
            </span>
          </div>
        </div>
        <div className="lecturer-detail-side">
          <Panel className="lecturer-metadata-panel">
            <span className="lecturer-panel-eyebrow">{locale === 'vi' ? 'Thông tin bản thảo' : 'Manuscript information'}</span>
            <dl className="lecturer-metadata-list">
              <div>
                <dt>{locale === 'vi' ? 'Tác giả' : 'Author'}</dt>
                <dd>
                  {uploader}{' '}
                  {isFaculty ? (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>({locale === 'vi' ? 'Ẩn danh đôi' : 'Double-Blind'})</span>
                  ) : detail.publication.uploader?.email ? (
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>({detail.publication.uploader.email})</span>
                  ) : null}
                </dd>
              </div>
              <div><dt>{locale === 'vi' ? 'Trạng thái' : 'Status'}</dt><dd><StatusBadge status={detail.publication.status} /></dd></div>
              <div><dt>{locale === 'vi' ? 'Vai trò' : 'Role'}</dt><dd><strong>{isPrimary ? (locale === 'vi' ? 'Giảng viên thẩm định chính (Lead)' : 'Primary Lecturer (Lead)') : isSecondary ? (locale === 'vi' ? 'Giảng viên đồng thẩm định' : 'Secondary Reviewer') : (locale === 'vi' ? 'Người thẩm định' : 'Reviewer')}</strong></dd></div>
              <div>
                <dt>{locale === 'vi' ? 'Tác giả' : 'Authors'}</dt>
                <dd>
                  <ReviewAuthorsList
                    authors={detail.publication.authors}
                    fallback={isFaculty ? (locale === 'vi' ? 'Tác giả ẩn danh (Thẩm định đôi)' : 'Anonymous Author (Double-Blind Review)') : uploader}
                  />
                </dd>
              </div>
              <div><dt>{locale === 'vi' ? 'Từ khóa' : 'Keywords'}</dt><dd>{detail.publication.keywords?.join(', ') || (locale === 'vi' ? 'Chưa có từ khóa' : 'No keywords provided')}</dd></div>
            </dl>
          </Panel>

          {/* Secondary Reviewers Feedback (visible only to Primary Lecturer) */}
          {isPrimary && (
            <Panel className="lecturer-secondary-panel">
              <div className="lecturer-panel-heading" style={{ marginBottom: '8px' }}>
                <div>
                  <span className="lecturer-panel-eyebrow">{locale === 'vi' ? 'Ý kiến phản biện đồng cấp' : 'Peer Review Evidence'}</span>
                  <h2>{locale === 'vi' ? `Giảng viên đồng phản biện (${secondarySubmittedCount}/${secondaryReviews.length || 2} đã nộp)` : `Secondary Reviewers (${secondarySubmittedCount}/${secondaryReviews.length || 2} submitted)`}</h2>
                </div>
              </div>
              {secondaryReviews.length === 0 ? (
                <p className="lecturer-muted" style={{ fontStyle: 'italic', margin: 0 }}>
                  {locale === 'vi' ? 'Chưa có giảng viên đồng phản biện nào được phân công.' : 'Secondary reviewers have not been assigned yet.'}
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
                                  {locale === 'vi' ? 'Đồng phản biện' : 'Secondary'}
                                </span>
                              </div>
                              <p className="simple-reviewer-item__sub">
                                {locale === 'vi' ? 'Người phản biện độc lập' : 'Independent Reviewer'} · {formatDate(rev.submittedAt || rev.updatedAt || rev.createdAt)}
                              </p>
                            </div>
                          </div>

                          <div className="simple-reviewer-item__badge">
                            {isNeedsRevision && (
                              <span className="user-badge user-badge--revision" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                {locale === 'vi' ? 'Cần chỉnh sửa' : 'Needs Revision'}
                              </span>
                            )}
                            {isPublish && (
                              <span className="user-badge user-badge--approved" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                {locale === 'vi' ? 'Đề xuất xuất bản' : 'Recommend Publish'}
                              </span>
                            )}
                            {isReject && (
                              <span className="user-badge user-badge--withdrawn" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                                {locale === 'vi' ? 'Đề xuất từ chối' : 'Recommend Reject'}
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
                                {locale === 'vi' ? 'Đang chờ' : 'Pending'}
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

          {/* Unified Evaluation & Decision Panel */}
          <Panel className="lecturer-review-panel">
            <div className="lecturer-panel-heading">
              <div>
                <span className="lecturer-panel-eyebrow">
                  {isPrimary
                    ? (locale === 'vi' ? 'Đánh giá & Quyết định thẩm định chính' : 'Lead academic evaluation')
                    : (locale === 'vi' ? 'Đánh giá độc lập' : 'Independent evaluation')}
                </span>
                <h2>
                  {isPrimary
                    ? (locale === 'vi' ? 'Đánh giá học thuật & Quyết định' : 'Academic evaluation & decision')
                    : submitted
                    ? (locale === 'vi' ? 'Cập nhật đánh giá của bạn' : 'Update your review')
                    : (locale === 'vi' ? 'Gửi đánh giá thẩm định' : 'Submit your review')}
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
                  {locale === 'vi' ? 'Chấp thuận' : 'Publish'}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isPrimary ? primaryDecision === 'DRAFTING' : recommendation === 'NEEDS_REVISION'}
                  className={`segmented-pill-btn ${(isPrimary ? primaryDecision === 'DRAFTING' : recommendation === 'NEEDS_REVISION') ? 'segmented-pill-btn--active' : ''}`}
                  onClick={() => (isPrimary ? setPrimaryDecision('DRAFTING') : setRecommendation('NEEDS_REVISION'))}
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                >
                  {locale === 'vi' ? 'Chỉnh sửa' : 'Revision'}
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={isPrimary ? primaryDecision === 'REJECTED' : recommendation === 'REJECT'}
                  className={`segmented-pill-btn ${(isPrimary ? primaryDecision === 'REJECTED' : recommendation === 'REJECT') ? 'segmented-pill-btn--active' : ''}`}
                  onClick={() => (isPrimary ? setPrimaryDecision('REJECTED') : setRecommendation('REJECT'))}
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                >
                  {locale === 'vi' ? 'Từ chối' : 'Reject'}
                </button>
              </div>

              <Field
                label={isPrimary ? (locale === 'vi' ? 'Đánh giá & Yêu cầu chỉnh sửa' : 'Evaluation & requirements') : (locale === 'vi' ? 'Nhận xét chuyên môn' : 'Comments')}
                hint={
                  isPrimary
                    ? (locale === 'vi' ? 'Giải thích nhận xét học thuật và các yêu cầu chỉnh sửa gửi tới tác giả.' : 'Explain the academic evaluation and requirements for the author. This is recorded as the decision rationale.')
                    : (locale === 'vi' ? 'Nêu rõ căn cứ học thuật cho khuyến nghị đánh giá của bạn.' : 'Explain the main academic evidence behind your recommendation.')
                }
              >
                <TextArea
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={6}
                  placeholder={locale === 'vi' ? 'Nhập nội dung nhận xét và đánh giá chuyên môn...' : 'Enter your evaluation comments...'}
                  disabled={saving || (isPrimary && detail.publication.status !== 'REVIEWING')}
                />
              </Field>

              {isPrimary ? (
                detail.publication.status === 'REVIEWING' ? (
                  <Button type="submit" loading={saving} style={{ width: '100%' }}>
                    {locale === 'vi' ? 'Gửi quyết định thẩm định' : 'Submit Decision'}
                  </Button>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid var(--hd-line)', borderRadius: '6px', fontSize: '13px', color: 'var(--hd-muted)' }}>
                    {locale === 'vi' ? 'Quyết định quy trình đã được hoàn tất với trạng thái' : 'Workflow decision finalized as'} <strong>{detail.publication.status}</strong>.
                  </div>
                )
              ) : (
                detail.publication.status === 'REVIEWING' ? (
                  <Button type="submit" loading={saving} style={{ width: '100%' }}>
                    {locale === 'vi' ? 'Gửi đánh giá' : 'Submit Review'}
                  </Button>
                ) : (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid var(--hd-line)', borderRadius: '6px', fontSize: '13px', color: 'var(--hd-muted)' }}>
                    {locale === 'vi' ? 'Vòng thẩm định này hiện đã đóng.' : 'Review period is closed for this round.'}
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
