'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { StudentDashboardLayout } from '../components';
import { studentPreprintApi } from '../api';
import { usePreprintList } from '../hooks';
import type { StudentPreprint } from '../types';

type FeedbackFilter = 'ALL' | 'ACTION' | 'REVIEW';

export function StudentMentorFeedbackView() {
  const { items, loading: listLoading, error: listError } = usePreprintList();
  const [filter, setFilter] = useState<FeedbackFilter>('ALL');
  const [reviewedManuscripts, setReviewedManuscripts] = useState<StudentPreprint[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (items.length === 0) {
      setReviewedManuscripts([]);
      setReviewsLoading(false);
      return () => { active = false; };
    }

    setReviewsLoading(true);
    setReviewsError(null);
    Promise.all(items.map((item) => studentPreprintApi.get(item.id)))
      .then((records) => {
        if (active) setReviewedManuscripts(records.filter((record) => record.reviews?.length));
      })
      .catch((reason: unknown) => {
        if (active) setReviewsError(reason instanceof Error ? reason : new Error('Unable to load reviewer feedback.'));
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });

    return () => { active = false; };
  }, [items]);

  const actionCount = useMemo(
    () => reviewedManuscripts.filter((item) => item.reviews?.some((review) => review.decision === 'NEEDS_REVISION')).length,
    [reviewedManuscripts],
  );
  const reviewCount = useMemo(
    () => reviewedManuscripts.filter((item) => item.status === 'UNDER_REVIEW').length,
    [reviewedManuscripts],
  );
  const visibleManuscripts = useMemo(() => reviewedManuscripts.filter((item) => {
    if (filter === 'ACTION') return item.reviews?.some((review) => review.decision === 'NEEDS_REVISION');
    if (filter === 'REVIEW') return item.status === 'UNDER_REVIEW';
    return true;
  }), [filter, reviewedManuscripts]);

  return (
    <StudentDashboardLayout
      title="Mentor Feedback & Reviews"
      revisionCount={actionCount}
      totalCount={items.length}
    >
      <div className="dashboard-page-header">
        <div className="dashboard-page-header__left">
          <span className="dashboard-hero__eyebrow">ACADEMIC PEER MENTORSHIP</span>
          <h1 className="dashboard-hero__title" style={{ fontSize: '24px', margin: '0 0 6px' }}>
            Faculty Mentor Feedback &amp; Reviews
          </h1>
          <p className="dashboard-hero__subtitle" style={{ margin: 0 }}>
            Track evaluations and revision requests returned by assigned lecturers.
          </p>
        </div>
        <div className="dashboard-page-header__right">
          <Link href="/student/my-preprints" className="dashboard-btn dashboard-btn--primary">
            My Manuscripts
          </Link>
        </div>
      </div>

      <div className="dashboard-metrics-grid" style={{ marginBottom: '24px' }}>
        <div className="dashboard-metric-card dashboard-metric-card--alert">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Action Required</span>
          </div>
          <div className="dashboard-metric-card__value">{actionCount}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--amber">
            <span>Revision requests from lecturers</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Under Review</span>
          </div>
          <div className="dashboard-metric-card__value">{reviewCount}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--sky">
            <span>Manuscripts currently being reviewed</span>
          </div>
        </div>
        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Feedback Records</span>
          </div>
          <div className="dashboard-metric-card__value">{reviewedManuscripts.length}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--neutral">
            <span>Loaded from publication API</span>
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <div className="dashboard-card__header">
          <h2 className="dashboard-card__title">Mentor Feedback Stream</h2>
          <div className="dashboard-card__filters">
            <button type="button" className={`dashboard-filter-btn ${filter === 'ALL' ? 'dashboard-filter-btn--active' : ''}`} onClick={() => setFilter('ALL')}>
              All Evaluations
            </button>
            <button type="button" className={`dashboard-filter-btn ${filter === 'ACTION' ? 'dashboard-filter-btn--active' : ''}`} onClick={() => setFilter('ACTION')}>
              Action Required ({actionCount})
            </button>
            <button type="button" className={`dashboard-filter-btn ${filter === 'REVIEW' ? 'dashboard-filter-btn--active' : ''}`} onClick={() => setFilter('REVIEW')}>
              Under Review ({reviewCount})
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {listLoading || reviewsLoading ? (
            <div className="dashboard-loading">Loading reviewer feedback…</div>
          ) : listError || reviewsError ? (
            <div className="dashboard-error">Error: {(listError || reviewsError)?.message}</div>
          ) : visibleManuscripts.length === 0 ? (
            <div className="dashboard-empty">No reviewer feedback has been recorded yet.</div>
          ) : (
            visibleManuscripts.map((manuscript) => {
              const latestReview = manuscript.reviews?.[0];
              if (!latestReview) return null;
              const needsRevision = latestReview.decision === 'NEEDS_REVISION';

              return (
                <article key={manuscript.id} className="dashboard-alert-banner" style={{ display: 'block', padding: '22px 24px', background: '#ffffff', border: `1px solid ${needsRevision ? '#fde68a' : '#e2e8f0'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{latestReview.reviewer_name}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>
                        {latestReview.reviewer_title} · {new Date(latestReview.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className={`user-badge ${needsRevision ? 'user-badge--revision' : 'user-badge--approved'}`}>
                      {needsRevision ? 'NEEDS REVISION' : latestReview.decision}
                    </span>
                  </div>

                  <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>MANUSCRIPT</span>
                    <h3 style={{ margin: '3px 0 0', fontSize: '16px', color: '#0f172a', fontWeight: 700 }}>
                      <Link href={`/student/my-preprints/${manuscript.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {manuscript.title}
                      </Link>
                    </h3>
                  </div>

                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                    {latestReview.comments || 'The lecturer did not provide additional comments.'}
                  </p>

                  {needsRevision && (
                    <div style={{ marginTop: '16px' }}>
                      <Link href={`/student/my-preprints/${manuscript.id}/edit`} className="dashboard-btn dashboard-btn--primary" style={{ background: '#d97706' }}>
                        Open Revision Editor →
                      </Link>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export default StudentMentorFeedbackView;
