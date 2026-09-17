'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks';
import { StudentDashboardLayout } from '../components';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';
import type { StudentPreprint } from '../types';

export function StudentDashboardView() {
  const { user } = useAuth();
  const displayName = user?.name || user?.email || 'Scholar';
  const { items, loading, error } = usePreprintList();
  const [filterStatus, setFilterStatus] = useState<'ALL' | PreprintStatus>('ALL');
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = items.length;
    const underReview = items.filter((i) => i.status === 'UNDER_REVIEW').length;
    const needsRevision = items.filter((i) => i.status === 'NEEDS_REVISION').length;
    const approved = items.filter((i) => i.status === 'APPROVED' || i.status === 'PUBLISHED').length;
    return { total, underReview, needsRevision, approved };
  }, [items]);

  // Needs revision item
  const revisionItem = useMemo(() => {
    return items.find((i) => i.status === 'NEEDS_REVISION');
  }, [items]);

  // Filtered list for the dashboard table
  const displayedItems = useMemo(() => {
    if (filterStatus === 'ALL') return items;
    return items.filter((i) => i.status === filterStatus);
  }, [items, filterStatus]);

  const handleCopyCitation = (item: StudentPreprint) => {
    const citation = `${item.authors.map((a) => a.name).join(', ')} (2026). "${item.title}." Hyperdata Lab Preprint Repository. DOI: ${item.doi || '10.5281/zenodo.hdl-preview'}`;
    navigator.clipboard.writeText(citation);
    setCopiedDoi(item.id);
    setTimeout(() => setCopiedDoi(null), 2500);
  };

  return (
    <StudentDashboardLayout
      title="Research Dashboard"
      revisionCount={metrics.needsRevision}
      totalCount={metrics.total}
    >
      {/* 1. Scholar Welcome Hero Banner */}
      <div className="dashboard-hero">
        <div className="dashboard-hero__main">
          <div className="dashboard-hero__greeting">
            <span className="dashboard-hero__eyebrow">STUDENT RESEARCH SCHOLAR</span>
            <h1 className="dashboard-hero__title">Welcome back, {displayName} 👋</h1>
            <p className="dashboard-hero__subtitle">
              Manage your manuscripts, track faculty mentorship assessments, and monitor priority timestamp verification.
            </p>
          </div>
          <div className="dashboard-hero__tags">
            <span className="dashboard-hero__tag">
              <span className="dashboard-hero__tag-dot" />
              Verified Author
            </span>
            <span className="dashboard-hero__tag">ID: {user?.id?.substring(0, 8) || "STU-2026"}</span>
            <span className="dashboard-hero__tag">{user?.email?.split("@")[1] || "University Scholar"}</span>
          </div>
        </div>
        <div className="dashboard-hero__action">
          <Link href="/student/my-preprints/new" className="dashboard-btn dashboard-btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Submit New Preprint</span>
          </Link>
        </div>
      </div>

      {/* 2. Urgent Action Alert (Revision Required) */}
      {revisionItem && (
        <div className="dashboard-alert-banner">
          <div className="dashboard-alert-banner__icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="dashboard-alert-banner__content">
            <div className="dashboard-alert-banner__header">
              <strong className="dashboard-alert-banner__title">Action Required: Revision Requested</strong>
              <span className="dashboard-alert-banner__badge">Version {revisionItem.current_version}</span>
            </div>
            <p className="dashboard-alert-banner__desc">
              Faculty reviewer <strong>{revisionItem.reviews?.[0]?.reviewer_name || 'Advisory Reviewer'}</strong> requested methodological updates on <em>&ldquo;{revisionItem.title}&rdquo;</em>.
            </p>
          </div>
          <div className="dashboard-alert-banner__action">
            <Link
              href={`/student/my-preprints/${revisionItem.id}?tab=reviews`}
              className="dashboard-alert-banner__btn"
            >
              Review Comments &amp; Revise →
            </Link>
          </div>
        </div>
      )}

      {/* 3. Key Performance Metric Cards */}
      <div className="dashboard-metrics-grid">
        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Total Manuscripts</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{metrics.total}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--neutral">
            <span>Registered in repository</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">In Faculty Review</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--sky">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{metrics.underReview}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--sky">
            <span>Under advisory evaluation</span>
          </div>
        </div>

        <div className="dashboard-metric-card dashboard-metric-card--alert">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Action Required</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--amber">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{metrics.needsRevision}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--amber">
            <span>Needs student response</span>
          </div>
        </div>

        <div className="dashboard-metric-card">
          <div className="dashboard-metric-card__header">
            <span className="dashboard-metric-card__label">Approved &amp; Verified</span>
            <div className="dashboard-metric-card__icon dashboard-metric-card__icon--green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
          <div className="dashboard-metric-card__value">{metrics.approved}</div>
          <div className="dashboard-metric-card__trend dashboard-metric-card__trend--green">
            <span>Camera-ready / Public</span>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Dashboard Layout */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Manuscripts & Research Stepper */}
        <div className="dashboard-grid__primary">
          {/* Recent Manuscripts Section */}
          <div className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <h2 className="dashboard-card__title">Recent Manuscripts</h2>
                <p className="dashboard-card__desc">Review submission progress and cryptographic validation</p>
              </div>
              <div className="dashboard-card__filters">
                <button
                  type="button"
                  className={`dashboard-filter-btn ${filterStatus === 'ALL' ? 'dashboard-filter-btn--active' : ''}`}
                  onClick={() => setFilterStatus('ALL')}
                >
                  All ({metrics.total})
                </button>
                <button
                  type="button"
                  className={`dashboard-filter-btn ${filterStatus === 'NEEDS_REVISION' ? 'dashboard-filter-btn--active' : ''}`}
                  onClick={() => setFilterStatus('NEEDS_REVISION')}
                >
                  Action ({metrics.needsRevision})
                </button>
                <button
                  type="button"
                  className={`dashboard-filter-btn ${filterStatus === 'UNDER_REVIEW' ? 'dashboard-filter-btn--active' : ''}`}
                  onClick={() => setFilterStatus('UNDER_REVIEW')}
                >
                  In Review ({metrics.underReview})
                </button>
              </div>
            </div>

            {loading ? (
              <div className="dashboard-loading">Loading manuscripts…</div>
            ) : error ? (
              <div className="dashboard-error">Error: {error.message}</div>
            ) : displayedItems.length === 0 ? (
              <div className="dashboard-empty">No manuscripts found for this filter.</div>
            ) : (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Manuscript</th>
                      <th>Discipline</th>
                      <th>Version</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedItems.map((item) => (
                      <tr key={item.id}>
                        <td className="dashboard-table__title-cell">
                          <Link href={`/student/my-preprints/${item.id}`} className="dashboard-table__title-link">
                            {item.title}
                          </Link>
                          <span className="dashboard-table__sha">
                            {item.sha256 ? `SHA-256: ${item.sha256.substring(0, 16)}…` : 'Cryptographic timestamp pending'}
                          </span>
                        </td>
                        <td>
                          <span className="dashboard-badge-tag">{item.discipline || 'General'}</span>
                        </td>
                        <td>
                          <span className="dashboard-version-pill">v{item.current_version}</span>
                        </td>
                        <td>
                          {item.status === 'NEEDS_REVISION' && (
                            <span className="user-badge user-badge--revision">NEEDS REVISION</span>
                          )}
                          {item.status === 'UNDER_REVIEW' && (
                            <span className="user-badge user-badge--review">UNDER REVIEW</span>
                          )}
                          {(item.status === 'APPROVED' || item.status === 'PUBLISHED') && (
                            <span className="user-badge user-badge--approved">APPROVED</span>
                          )}
                          {item.status === 'DRAFT' && (
                            <span className="user-badge user-badge--draft">DRAFT</span>
                          )}
                        </td>
                        <td className="dashboard-table__date">
                          {(() => {
                            if (!item.updated_at) return 'Sep 14';
                            const d = new Date(item.updated_at);
                            return isNaN(d.getTime()) ? 'Sep 14' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          })()}
                        </td>
                        <td>
                          <div className="dashboard-table__actions">
                            <Link
                              href={`/student/my-preprints/${item.id}`}
                              className="dashboard-table__action-btn"
                              title="Open Manuscript"
                            >
                              Open →
                            </Link>
                            <button
                              type="button"
                              className="dashboard-table__cite-btn"
                              onClick={() => handleCopyCitation(item)}
                              title="Copy Citation"
                            >
                              {copiedDoi === item.id ? 'Copied!' : 'Cite'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="dashboard-card__footer">
              <Link href="/student/my-preprints" className="dashboard-card__view-all">
                View all manuscripts in repository →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column: Faculty Mentorship Activity & Deadlines */}
        <div className="dashboard-grid__secondary">
          {/* Faculty Review Feedback Feed */}
          <div className="dashboard-card">
            <div className="dashboard-card__header">
              <h2 className="dashboard-card__title">Faculty Advisory Activity</h2>
            </div>
            <div className="dashboard-mentor-list">
              <div className="dashboard-mentor-item">
                <div className="dashboard-mentor-avatar">LT</div>
                <div className="dashboard-mentor-content">
                  <div className="dashboard-mentor-top">
                    <strong>Dr. Linh Tran</strong>
                    <span className="dashboard-mentor-badge">Advisory Reviewer</span>
                  </div>
                  <p className="dashboard-mentor-comment">
                    &ldquo;Please update Figure 4 confidence intervals and provide the raw dataset repository link before final approval.&rdquo;
                  </p>
                  <div className="dashboard-mentor-meta">
                    <span>Mapping data literacy · v2</span>
                    <Link href="/student/my-preprints/manuscript-stem-01?tab=reviews" className="dashboard-mentor-link">
                      Respond →
                    </Link>
                  </div>
                </div>
              </div>

              <div className="dashboard-mentor-item">
                <div className="dashboard-mentor-avatar dashboard-mentor-avatar--purple">NT</div>
                <div className="dashboard-mentor-content">
                  <div className="dashboard-mentor-top">
                    <strong>Assoc. Prof. Nguyen Van Thuan</strong>
                    <span className="dashboard-mentor-badge dashboard-mentor-badge--neutral">Scope Review</span>
                  </div>
                  <p className="dashboard-mentor-comment">
                    Assigned to peer review protocol evaluation for collaborative academic journals.
                  </p>
                  <div className="dashboard-mentor-meta">
                    <span>Collaborative peer review · v1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Deadlines Card */}
          <div className="dashboard-card dashboard-card--accent">
            <div className="dashboard-card__header">
              <h2 className="dashboard-card__title">Upcoming Milestones</h2>
            </div>
            <div className="dashboard-milestones">
              <div className="dashboard-milestone-item">
                <div className="dashboard-milestone-date">
                  <span className="dashboard-milestone-month">SEP</span>
                  <span className="dashboard-milestone-day">25</span>
                </div>
                <div className="dashboard-milestone-info">
                  <strong>Faculty Mentorship Sign-off</strong>
                  <p>Deadline for Q3 manuscript revision approvals</p>
                </div>
              </div>
              <div className="dashboard-milestone-item">
                <div className="dashboard-milestone-date">
                  <span className="dashboard-milestone-month">OCT</span>
                  <span className="dashboard-milestone-day">15</span>
                </div>
                <div className="dashboard-milestone-info">
                  <strong>Student Research Symposium</strong>
                  <p>Camera-ready proceedings archiving</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentDashboardLayout>
  );
}

export const PreprintDashboardView = StudentDashboardView;
export default StudentDashboardView;
