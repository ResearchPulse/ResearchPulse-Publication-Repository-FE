'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { studentPreprintApi } from '../api';
import { usePreprintList } from '../hooks';
import type { StudentPreprint } from '../types';

type FeedbackFilter = 'ALL' | 'ACTION' | 'REVIEW' | 'APPROVED';
type SortOption = 'UPDATED' | 'TITLE' | 'REVIEWER';

export function StudentMentorFeedbackView() {
  const { items, loading: listLoading, error: listError } = usePreprintList();
  const [filter, setFilter] = useState<FeedbackFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('UPDATED');
  const [reviewedManuscripts, setReviewedManuscripts] = useState<StudentPreprint[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    if (items.length === 0) {
      setReviewedManuscripts([]);
      setReviewsLoading(false);
      return () => {
        active = false;
      };
    }

    setReviewsLoading(true);
    setReviewsError(null);
    Promise.all(items.map((item) => studentPreprintApi.get(item.id)))
      .then((records) => {
        if (active) {
          // Include manuscripts that have feedback records or are currently under review
          setReviewedManuscripts(
            records.filter((record) => (record.reviews && record.reviews.length > 0) || record.status === 'UNDER_REVIEW'),
          );
        }
      })
      .catch((reason: unknown) => {
        if (active) setReviewsError(reason instanceof Error ? reason : new Error('Unable to load reviewer feedback.'));
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [items]);

  // Counts for filter pills
  const actionCount = useMemo(
    () =>
      items.filter(
        (item) => item.status === 'NEEDS_REVISION' || item.reviews?.some((review) => review.decision === 'NEEDS_REVISION'),
      ).length,
    [items],
  );

  const reviewCount = useMemo(
    () => items.filter((item) => item.status === 'UNDER_REVIEW').length,
    [items],
  );

  const approvedCount = useMemo(
    () => items.filter((item) => item.status === 'APPROVED' || item.status === 'PUBLISHED').length,
    [items],
  );

  const totalTracked = useMemo(() => {
    return reviewedManuscripts.length;
  }, [reviewedManuscripts]);

  // Filter and sort stream
  const visibleManuscripts = useMemo(() => {
    let result = reviewedManuscripts;

    if (filter === 'ACTION') {
      result = result.filter(
        (item) => item.status === 'NEEDS_REVISION' || item.reviews?.some((review) => review.decision === 'NEEDS_REVISION'),
      );
    } else if (filter === 'REVIEW') {
      result = result.filter((item) => item.status === 'UNDER_REVIEW');
    } else if (filter === 'APPROVED') {
      result = result.filter(
        (item) =>
          item.status === 'APPROVED' ||
          item.status === 'PUBLISHED' ||
          item.reviews?.some((review) => review.decision === 'APPROVED'),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.discipline?.toLowerCase().includes(q) ||
          item.reviews?.some((r) => r.reviewer_name?.toLowerCase().includes(q)),
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'REVIEWER') {
        const nameA = a.reviews?.[0]?.reviewer_name || '';
        const nameB = b.reviews?.[0]?.reviewer_name || '';
        return nameA.localeCompare(nameB);
      }
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [filter, reviewedManuscripts, searchQuery, sortBy]);

  return (
    <StudentShell title="Mentor Feedback & Reviews" showStandardHeader={false}>
      {/* 1. Filter Toolbar (Synced identically with My Manuscripts / Hình 2) */}
      <div className="student-filter-toolbar">
        {/* Status Tab Pills */}
        <div className="student-tabs-pills" role="tablist" aria-label="Filter feedback by status">
          <button
            type="button"
            className={`student-tab-pill ${filter === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All <span className="student-tab-pill__count">{totalTracked}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'REVIEW' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('REVIEW')}
          >
            In Review <span className="student-tab-pill__count">{reviewCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'ACTION' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => setFilter('ACTION')}
          >
            Needs Revision <span className="student-tab-pill__count">{actionCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'APPROVED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('APPROVED')}
          >
            Approved <span className="student-tab-pill__count">{approvedCount}</span>
          </button>
        </div>

        {/* Search & Sort Actions */}
        <div className="student-toolbar-actions">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search manuscripts, reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="student-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="student-search-clear">
                ×
              </button>
            )}
          </div>

          <div className="student-sort-box">
            <span className="student-sort-label">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="student-sort-select"
            >
              <option value="UPDATED">Recently Updated</option>
              <option value="TITLE">Title (A-Z)</option>
              <option value="REVIEWER">Reviewer Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Feedback Stream Content (Flat, Modern & Spacious) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {listLoading || reviewsLoading ? (
          <div className="student-loading-box">
            <div className="student-spinner" />
            <p>Loading reviewer feedback and academic evaluations…</p>
          </div>
        ) : listError || reviewsError ? (
          <div className="student-error" role="alert">
            Error: {(listError || reviewsError)?.message}
          </div>
        ) : visibleManuscripts.length === 0 ? (
          /* 3. Inspiring Academic Empty State */
          <div className="student-empty-card">
            <div className="student-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h3>
              {searchQuery
                ? 'No matching evaluations found'
                : filter === 'ACTION'
                ? 'No revision requests pending'
                : filter === 'REVIEW'
                ? 'No manuscripts currently under review'
                : filter === 'APPROVED'
                ? 'No approved manuscripts found'
                : 'No reviewer feedback recorded yet'}
            </h3>
            <p>
              {searchQuery
                ? `We couldn't find any reviews or manuscripts matching "${searchQuery}". Try a different keyword.`
                : filter === 'ACTION'
                ? 'All lecturer revision requests have been addressed or resubmitted. Great work maintaining your research cadence!'
                : filter === 'REVIEW'
                ? 'You currently have no manuscripts in the faculty evaluation queue. Submit a new preprint to begin peer review.'
                : filter === 'APPROVED'
                ? 'Manuscripts approved by faculty mentors will appear here once cleared.'
                : 'When you submit a manuscript, assigned faculty mentors review your preprint, provide constructive notes, and return revision items within the 48–72h mentorship window.'}
            </p>
            <div className="student-empty-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/student/my-preprints" className="student-btn student-btn--secondary">
                View My Manuscripts
              </Link>
              <Link href="/student/my-preprints/new" className="student-btn student-btn--primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Start New Submission</span>
              </Link>
            </div>
          </div>
        ) : (
          visibleManuscripts.map((manuscript) => {
            const latestReview = manuscript.reviews?.[0];
            const isUnderReviewOnly = !latestReview && manuscript.status === 'UNDER_REVIEW';

            if (isUnderReviewOnly) {
              return (
                <article key={manuscript.id} className="mentor-review-card">
                  <div className="mentor-review-header">
                    <div className="mentor-reviewer-profile">
                      <div className="mentor-avatar" style={{ background: '#0284c7' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="mentor-reviewer-name">Faculty Reviewer Assigned</h4>
                        <p className="mentor-reviewer-meta">Evaluation in progress · Expected SLA 48–72 hours</p>
                      </div>
                    </div>
                    <span className="user-badge user-badge--review">UNDER REVIEW</span>
                  </div>

                  <div className="mentor-manuscript-strip">
                    <div className="mentor-manuscript-strip__header">
                      <span className="mentor-manuscript-tag">Manuscript</span>
                      <span className="mentor-version-tag">v{manuscript.current_version || '1.0'}</span>
                      {manuscript.discipline && (
                        <span className="mentor-version-tag" style={{ color: '#0071bc', background: '#e0f2fe' }}>
                          {manuscript.discipline}
                        </span>
                      )}
                    </div>
                    <h3 className="mentor-manuscript-title">
                      <Link href={`/student/my-preprints/${manuscript.id}`}>
                        {manuscript.title}
                      </Link>
                    </h3>
                  </div>

                  <p style={{ margin: 0, fontSize: '13.5px', color: '#64748b', lineHeight: 1.6 }}>
                    Your manuscript is currently in the faculty evaluation queue. You will be notified via email as soon as the mentor returns detailed comments.
                  </p>

                  <div className="mentor-review-actions">
                    <Link
                      href={`/student/my-preprints/${manuscript.id}`}
                      className="student-btn student-btn--secondary"
                    >
                      View Manuscript Details →
                    </Link>
                  </div>
                </article>
              );
            }

            if (!latestReview) return null;
            const needsRevision = latestReview.decision === 'NEEDS_REVISION';
            const reviewerInitials =
              latestReview.reviewer_name
                ?.split(' ')
                .map((w) => w[0])
                .filter(Boolean)
                .slice(-2)
                .join('')
                .toUpperCase() || 'FM';

            return (
              <article
                key={manuscript.id}
                className={`mentor-review-card ${needsRevision ? 'mentor-review-card--alert' : ''}`}
              >
                <div className="mentor-review-header">
                  <div className="mentor-reviewer-profile">
                    <div className="mentor-avatar">
                      {reviewerInitials}
                    </div>
                    <div>
                      <h4 className="mentor-reviewer-name">{latestReview.reviewer_name}</h4>
                      <p className="mentor-reviewer-meta">
                        {latestReview.reviewer_title || 'Faculty Mentor'} · {new Date(latestReview.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <span className={`user-badge ${needsRevision ? 'user-badge--revision' : 'user-badge--approved'}`}>
                    {needsRevision ? 'NEEDS REVISION' : latestReview.decision}
                  </span>
                </div>

                <div className="mentor-manuscript-strip">
                  <div className="mentor-manuscript-strip__header">
                    <span className="mentor-manuscript-tag">Manuscript</span>
                    <span className="mentor-version-tag">v{manuscript.current_version || '1.0'}</span>
                    {manuscript.discipline && (
                      <span className="mentor-version-tag" style={{ color: '#0071bc', background: '#e0f2fe' }}>
                        {manuscript.discipline}
                      </span>
                    )}
                  </div>
                  <h3 className="mentor-manuscript-title">
                    <Link href={`/student/my-preprints/${manuscript.id}`}>
                      {manuscript.title}
                    </Link>
                  </h3>
                </div>

                <blockquote className={`mentor-comments-quote ${needsRevision ? 'mentor-comments-quote--alert' : ''}`}>
                  &ldquo;{latestReview.comments || 'The lecturer did not provide additional comments.'}&rdquo;
                </blockquote>

                {latestReview.recommendations && latestReview.recommendations.length > 0 && (
                  <div className="mentor-action-items">
                    <strong className="mentor-action-items__title">Action Items &amp; Required Revisions:</strong>
                    <ul className="mentor-action-items__list">
                      {latestReview.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mentor-review-actions">
                  {needsRevision ? (
                    <>
                      <Link
                        href={`/student/my-preprints/${manuscript.id}/edit`}
                        className="student-btn student-btn--primary"
                        style={{ background: '#d97706', borderColor: '#d97706' }}
                      >
                        Open Revision Editor →
                      </Link>
                      <Link
                        href={`/student/my-preprints/${manuscript.id}`}
                        className="student-btn student-btn--secondary"
                      >
                        View Full Details
                      </Link>
                    </>
                  ) : (
                    <Link
                      href={`/student/my-preprints/${manuscript.id}`}
                      className="student-btn student-btn--secondary"
                    >
                      View Manuscript Details →
                    </Link>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </StudentShell>
  );
}

export default StudentMentorFeedbackView;
