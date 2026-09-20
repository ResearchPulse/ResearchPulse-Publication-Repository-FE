'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { TableSkeleton } from '@/components/skeleton';
import { SortDropdown } from '@/components/sort-dropdown';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';
import type { StudentPreprint } from '../types';

function formatUpdatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}



export function PreprintListView() {
  const { items, loading, error, apiPending } = usePreprintList();
  const [selectedTab, setSelectedTab] = useState<'ALL' | PreprintStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sortBy, setSortBy] = useState('UPDATED');
  const safeSortBy = sortBy;

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = items.length;
    const underReview = items.filter((i) => i.status === 'UNDER_REVIEW').length;
    const needsRevision = items.filter((i) => i.status === 'NEEDS_REVISION').length;
    const approved = items.filter((i) => i.status === 'APPROVED' || i.status === 'PUBLISHED').length;
    const drafts = items.filter((i) => i.status === 'DRAFT').length;
    return { total, underReview, needsRevision, approved, drafts };
  }, [items]);

  // Needs revision item for priority callout
  const revisionItem = useMemo(() => {
    return items.find((i) => i.status === 'NEEDS_REVISION');
  }, [items]);

  // Filtered and sorted manuscripts
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedTab !== 'ALL') {
          if (selectedTab === 'APPROVED') {
            if (item.status !== 'APPROVED' && item.status !== 'PUBLISHED') return false;
          } else if (item.status !== selectedTab) {
            return false;
          }
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchAbstract = item.abstract?.toLowerCase().includes(q);
          const matchDiscipline = item.discipline?.toLowerCase().includes(q);
          const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
          if (!matchTitle && !matchAbstract && !matchDiscipline && !matchKeywords) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (safeSortBy === 'TITLE') return a.title.localeCompare(b.title);
        if (safeSortBy === 'STATUS') return a.status.localeCompare(b.status);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [items, selectedTab, searchQuery, safeSortBy]);

  const renderStatusBadge = (status: PreprintStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="user-badge user-badge--approved">PUBLISHED</span>;
      case 'APPROVED':
        return <span className="user-badge user-badge--approved">APPROVED</span>;
      case 'NEEDS_REVISION':
        return <span className="user-badge user-badge--revision">NEEDS REVISION</span>;
      case 'UNDER_REVIEW':
        return <span className="user-badge user-badge--review">UNDER REVIEW</span>;
      case 'DRAFT':
        return <span className="user-badge user-badge--draft">DRAFT</span>;
      case 'WITHDRAWN':
      case 'REJECTED':
        return <span className="user-badge user-badge--withdrawn">REJECTED</span>;
      default:
        return <span className="user-badge">{status}</span>;
    }
  };

  return (
    <StudentShell title="My Manuscripts" showStandardHeader={false}>
      {/* Notice Banner */}
      {apiPending && (
        <div className="user-notice" style={{ marginTop: '0', marginBottom: '20px' }}>
          Preprint API is unavailable, so preview data is shown. Your work is not affected.
        </div>
      )}

      {/* Urgent Action Alert (Revision Required) */}
      {revisionItem && (
        <div className="dashboard-alert-banner" style={{ marginBottom: '20px' }}>
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
              Faculty reviewer <strong>{revisionItem.reviews?.[0]?.reviewer_name || 'Advisory Reviewer'}</strong> requested updates on <em>&ldquo;{revisionItem.title}&rdquo;</em>.
            </p>
          </div>
          <div className="dashboard-alert-banner__action">
            <Link
              href={`/student/my-preprints/${revisionItem.id}`}
              className="dashboard-alert-banner__btn"
            >
              Review Comments &amp; Revise →
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="student-metrics-grid">
        <div className="student-metric-card">
          <div className="student-metric-icon student-metric-icon--blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.total}</span>
            <span className="student-metric-label">Total Manuscripts</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-icon student-metric-icon--orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.underReview}</span>
            <span className="student-metric-label">In Faculty Review</span>
          </div>
        </div>

        <div className="student-metric-card student-metric-card--alert">
          <div className="student-metric-icon student-metric-icon--amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.needsRevision}</span>
            <span className="student-metric-label">Action Required</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-icon student-metric-icon--green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.approved}</span>
            <span className="student-metric-label">Approved &amp; Verified</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="student-filter-toolbar">
        {/* Status Tabs */}
        <div className="student-tabs-pills" role="tablist" aria-label="Filter manuscripts by status">
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('ALL')}
          >
            All <span className="student-tab-pill__count">{metrics.total}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'UNDER_REVIEW' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('UNDER_REVIEW')}
          >
            In Review <span className="student-tab-pill__count">{metrics.underReview}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'NEEDS_REVISION' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => setSelectedTab('NEEDS_REVISION')}
          >
            Needs Revision <span className="student-tab-pill__count">{metrics.needsRevision}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'APPROVED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('APPROVED')}
          >
            Approved <span className="student-tab-pill__count">{metrics.approved}</span>
          </button>
          {metrics.drafts > 0 && (
            <button
              type="button"
              className={`student-tab-pill ${selectedTab === 'DRAFT' ? 'student-tab-pill--active' : ''}`}
              onClick={() => setSelectedTab('DRAFT')}
            >
              Drafts <span className="student-tab-pill__count">{metrics.drafts}</span>
            </button>
          )}
        </div>

        {/* Search & Sort */}
        <div className="student-toolbar-actions">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search manuscripts..."
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
            <SortDropdown
              value={safeSortBy}
              onChange={(val) => setSortBy(val as 'UPDATED' | 'TITLE' | 'STATUS')}
              options={[
                { value: 'UPDATED', label: 'Recently Updated' },
                { value: 'TITLE', label: 'Title (A-Z)' },
                { value: 'STATUS', label: 'Status' },
              ]}
              style={{ width: '160px' }}
            />
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Manuscripts repository list">
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
              <TableSkeleton rows={5} type="submissions" />
            </tbody>
          </table>
        </div>
      )}

      {error && !loading && (
        <div className="student-error-banner">
          <strong>Error loading preprints:</strong> {error.message}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredItems.length === 0 && (
        <div className="student-empty-card">
          <div className="student-empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <h3>No manuscripts found</h3>
          <p>
            {searchQuery || selectedTab !== 'ALL'
              ? 'No manuscripts match your current filters. Try changing your search query or status tab.'
              : 'You have not submitted any preprints yet. Start your first research submission to obtain a cryptographic timestamp and faculty mentorship.'}
          </p>
        </div>
      )}

      {/* Manuscripts Table View */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Manuscripts repository list">
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
              {filteredItems.map((item: StudentPreprint) => (
                <tr key={item.id}>
                  <td className="dashboard-table__title-cell">
                    <div className="dashboard-table__title-group">
                      <Link href={`/student/my-preprints/${item.id}`} className="dashboard-table__title-link">
                        {item.title}
                      </Link>
                      {item.is_private && (
                        <span className="dashboard-private-pill">Private</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="dashboard-badge-tag">{item.discipline || 'General'}</span>
                  </td>
                  <td>
                    <span className="dashboard-version-pill">v{item.current_version}</span>
                  </td>
                  <td>
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="dashboard-table__date">
                    {formatUpdatedDate(item.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </StudentShell>
  );
}

export default PreprintListView;
