'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { StudentDashboardLayout } from '../components';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';

export function StudentDashboardView() {
  const { items, loading, error } = usePreprintList();
  const [filterStatus, setFilterStatus] = useState<'ALL' | PreprintStatus>('ALL');
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

  return (
    <StudentDashboardLayout
      title="Research Dashboard"
      revisionCount={metrics.needsRevision}
      totalCount={metrics.total}
    >
      {/* Urgent Action Alert (Revision Required) */}
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

      {/* 4. Full-Width Recent Manuscripts Section */}
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
            <table className="dashboard-table dashboard-table--repository">
              <thead>
                <tr>
                  <th style={{ width: '48%' }}>Manuscript</th>
                  <th>Discipline</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Updated</th>
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
                        if (!item.updated_at) return '—';
                        const d = new Date(item.updated_at);
                        return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })()}
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

      {/* 5. Bottom Widgets: Faculty Advisory Activity & Guidance */}
      <div className="dashboard-widgets-grid">
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
                  <strong>{revisionItem?.reviews?.[0]?.reviewer_name || 'No reviewer activity'}</strong>
                  <span className="dashboard-mentor-badge">Loaded from publication API</span>
                </div>
                <p className="dashboard-mentor-comment">
                  {revisionItem?.reviews?.[0]?.comments || 'No reviewer comments have been returned yet.'}
                </p>
                <div className="dashboard-mentor-meta">
                  <span>{revisionItem?.title || 'No manuscript review activity'}</span>
                  <Link href="/student/mentor-feedback" className="dashboard-mentor-link">
                    Open feedback
                  </Link>
                </div>
              </div>
            </div>

            <div className="dashboard-mentor-item">
              <div className="dashboard-mentor-avatar dashboard-mentor-avatar--purple">NT</div>
              <div className="dashboard-mentor-content">
                <div className="dashboard-mentor-top">
                  <strong>Reviewer assignments</strong>
                  <span className="dashboard-mentor-badge dashboard-mentor-badge--neutral">Publication API</span>
                </div>
                <p className="dashboard-mentor-comment">
                  Reviewer assignments and recommendations are managed in the admin workspace.
                </p>
                <div className="dashboard-mentor-meta">
                  <span>Review assignments are loaded from the publication API.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Guidance Card */}
        <div className="dashboard-card dashboard-card--accent">
          <div className="dashboard-card__header">
            <h2 className="dashboard-card__title">Submission Guidance</h2>
          </div>
          <div className="dashboard-milestones">
            <div className="dashboard-milestone-item">
              <div className="dashboard-milestone-info">
                <strong>Prepare your manuscript</strong>
                <p>Upload a PDF, verify the extracted metadata, and submit it for lecturer review.</p>
              </div>
            </div>
            <div className="dashboard-milestone-item">
              <div className="dashboard-milestone-info">
                <strong>Track the decision</strong>
                <p>Lecturers submit recommendations; only an administrator can publish the preprint.</p>
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
