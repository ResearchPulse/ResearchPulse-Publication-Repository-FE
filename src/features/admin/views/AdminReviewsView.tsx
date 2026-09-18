'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminReview, type AdminPublication } from '../api';
import { ROUTES } from '@/app/router';

type ReviewFilterTab = 'ALL' | 'PENDING' | 'NEEDS_REVISION' | 'PUBLISH' | 'REJECT';
type SortOption = 'UPDATED' | 'REVIEWER' | 'TITLE';

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function AdminReviewsView() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ReviewFilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('UPDATED');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    // Primary: fetch from /api/v1/admin/reviews
    adminApi
      .listAllReviews()
      .then((res) => {
        if (!active) return;
        if (res.items && res.items.length > 0) {
          setReviews(res.items);
          setLoading(false);
          return;
        }

        // Secondary fallback: if reviews list is empty, inspect submissions and gather reviews
        return adminApi.listSubmissions({ limit: 50 }).then(async (submissionsRes) => {
          if (!active) return;
          const pubs = submissionsRes.items || [];
          const allGathered: AdminReview[] = [];

          await Promise.all(
            pubs.map(async (pub: AdminPublication) => {
              try {
                const pubReviews = await adminApi.getReviews(pub.id);
                pubReviews.forEach((rev) => {
                  allGathered.push({
                    ...rev,
                    publication: {
                      id: pub.id,
                      title: pub.title,
                      status: pub.status,
                      currentVersionLabel: pub.currentVersion?.versionLabel || 'v1',
                      uploader: pub.uploader,
                    },
                  });
                });
              } catch {
                // Ignore individual submission review load failures
              }
            })
          );

          if (active) {
            setReviews(allGathered);
          }
        });
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unable to load reviews.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => !r.recommendation).length;
    const needsRevision = reviews.filter((r) => r.recommendation === 'NEEDS_REVISION').length;
    const publish = reviews.filter((r) => r.recommendation === 'PUBLISH').length;
    const reject = reviews.filter((r) => r.recommendation === 'REJECT').length;
    return { total, pending, needsRevision, publish, reject };
  }, [reviews]);

  // Filtered & Sorted items
  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        // Tab filtering
        if (activeTab === 'PENDING' && review.recommendation) return false;
        if (activeTab === 'NEEDS_REVISION' && review.recommendation !== 'NEEDS_REVISION') return false;
        if (activeTab === 'PUBLISH' && review.recommendation !== 'PUBLISH') return false;
        if (activeTab === 'REJECT' && review.recommendation !== 'REJECT') return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = review.publication?.title?.toLowerCase().includes(q);
          const matchReviewer = review.reviewer?.name?.toLowerCase().includes(q) || review.reviewer?.email?.toLowerCase().includes(q);
          const matchComment = review.comment?.toLowerCase().includes(q);
          if (!matchTitle && !matchReviewer && !matchComment) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'REVIEWER') {
          const nameA = a.reviewer?.name || a.reviewer?.email || '';
          const nameB = b.reviewer?.name || b.reviewer?.email || '';
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'TITLE') {
          const titleA = a.publication?.title || '';
          const titleB = b.publication?.title || '';
          return titleA.localeCompare(titleB);
        }
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [reviews, activeTab, searchQuery, sortBy]);

  return (
    <AdminShell active="reviews" title="Reviews">
      <AdminPageHeader
        eyebrow="Editorial Review Matrix"
        title="Review Oversight"
        description="Monitor faculty peer evaluations, track review SLAs, and evaluate lecturer recommendations across all manuscripts."
        actions={
          <Link href={ROUTES.ADMIN.SUBMISSIONS} className="student-btn student-btn--secondary" style={{ textDecoration: 'none' }}>
            Browse Submissions →
          </Link>
        }
      />

      {/* 1. Metrics Grid (Matching Student & Lecturer Dashboard) */}
      <div className="student-metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="student-metric-card">
          <div className="student-metric-icon" style={{ background: '#e0f2fe', color: '#0071bc' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.total}</span>
            <span className="student-metric-label">Total Assignments</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.pending}</span>
            <span className="student-metric-label">Awaiting Feedback</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: '#d97706' }}>{metrics.needsRevision}</span>
            <span className="student-metric-label">Revisions Requested</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: '#16a34a' }}>{metrics.publish}</span>
            <span className="student-metric-label">Publish Recommended</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar (Pills Tabs + Search + Sort) */}
      <div className="student-filter-toolbar" style={{ marginBottom: '20px' }}>
        <div className="student-tabs-pills">
          <button
            type="button"
            className={`student-tab-pill ${activeTab === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            All <span className="student-tab-pill__count">{metrics.total}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${activeTab === 'PENDING' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('PENDING')}
          >
            Awaiting Review <span className="student-tab-pill__count">{metrics.pending}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${activeTab === 'NEEDS_REVISION' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('NEEDS_REVISION')}
          >
            Needs Revision <span className="student-tab-pill__count">{metrics.needsRevision}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${activeTab === 'PUBLISH' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setActiveTab('PUBLISH')}
          >
            Publish Recommended <span className="student-tab-pill__count">{metrics.publish}</span>
          </button>
        </div>

        <div className="student-search-sort-group">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="student-search-input"
              placeholder="Search manuscript, lecturer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="student-sort-box">
            <label htmlFor="admin-sort-reviews" className="student-sort-label">Sort:</label>
            <select
              id="admin-sort-reviews"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="student-sort-select"
            >
              <option value="UPDATED">Recently Updated</option>
              <option value="REVIEWER">Lecturer Name</option>
              <option value="TITLE">Manuscript Title</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Review Oversight Table Card */}
      <div className="dashboard-table-card">
        {loading ? (
          <div className="student-loading-box">
            <div className="student-spinner" />
            <p>Loading peer reviews and faculty assignments…</p>
          </div>
        ) : error ? (
          <div className="student-error" role="alert">
            Error loading reviews: {error}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="student-empty-card" style={{ padding: '48px 24px' }}>
            <div className="student-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>No review assignments found</h3>
            <p>
              {searchQuery
                ? `No reviews matched "${searchQuery}". Try a different keyword.`
                : activeTab !== 'ALL'
                ? 'No review assignments match the selected status filter.'
                : 'No faculty reviews have been assigned to preprints yet. Open a submission to assign lecturers.'}
            </p>
            <Link href={ROUTES.ADMIN.SUBMISSIONS} className="student-btn student-btn--primary" style={{ textDecoration: 'none' }}>
              Inspect Submissions →
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '280px' }}>Manuscript</th>
                  <th>Assigned Lecturer</th>
                  <th>Evaluation Status</th>
                  <th style={{ minWidth: '220px' }}>Feedback Notes</th>
                  <th>Submitted / SLA</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => {
                  const reviewerInitials =
                    review.reviewer?.name
                      ?.split(' ')
                      .map((w) => w[0])
                      .filter(Boolean)
                      .slice(-2)
                      .join('')
                      .toUpperCase() || 'LR';

                  return (
                    <tr key={review.id}>
                      {/* Manuscript Column */}
                      <td>
                        <div className="title-cell">
                          <Link
                            href={`${ROUTES.ADMIN.SUBMISSIONS}/${review.publicationId}`}
                            style={{
                              fontWeight: 700,
                              color: '#0f172a',
                              textDecoration: 'none',
                              fontSize: '14px',
                              lineHeight: 1.4,
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            {review.publication?.title || 'Untitled Manuscript'}
                          </Link>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="version-pill">
                              {review.publication?.currentVersionLabel || `Round ${review.round}`}
                            </span>
                            {review.publication?.uploader?.name && (
                              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                                Author: {review.publication.uploader.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lecturer Reviewer Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="reviewer-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                            {reviewerInitials}
                          </div>
                          <div>
                            <strong style={{ display: 'block', fontSize: '13.5px', color: '#0f172a' }}>
                              {review.reviewer?.name || review.reviewer?.email || review.reviewerId}
                            </strong>
                            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {review.reviewer?.email || 'Faculty Reviewer'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Evaluation Status Column */}
                      <td>
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
                          <span className="user-badge user-badge--review">IN PROGRESS</span>
                        )}
                      </td>

                      {/* Feedback Notes Column */}
                      <td>
                        {review.comment ? (
                          <span style={{ fontSize: '13px', color: '#334155', fontStyle: 'italic' }}>
                            &ldquo;{review.comment.length > 60 ? review.comment.slice(0, 60) + '…' : review.comment}&rdquo;
                          </span>
                        ) : (
                          <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                            Pending reviewer submission
                          </span>
                        )}
                      </td>

                      {/* SLA / Submitted Column */}
                      <td>
                        <div style={{ fontSize: '12.5px', color: '#334155' }}>
                          {formatDate(review.submittedAt || review.updatedAt)}
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {review.submittedAt ? 'Evaluation complete' : 'Expected SLA 48–72h'}
                        </span>
                      </td>

                      {/* Action Column */}
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          href={`${ROUTES.ADMIN.SUBMISSIONS}/${review.publicationId}`}
                          className="student-btn student-btn--secondary student-btn--sm"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <span>Inspect</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default AdminReviewsView;

