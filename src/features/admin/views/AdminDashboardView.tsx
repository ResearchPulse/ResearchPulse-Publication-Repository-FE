'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/app/router';
import { AdminShell } from '../components';
import { adminApi, type AdminOverview } from '../api';
import { Skeleton, TableSkeleton } from '@/components/skeleton';
import { SortDropdown } from '@/components/sort-dropdown';

type SubmissionStatusFilter = 'ALL' | 'REVIEWING' | 'NEEDS_REVISION' | 'PUBLISHED';
type SortOption = 'UPDATED' | 'TITLE' | 'STATUS';

function displayDate(value?: string) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

function renderStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'PUBLISHED':
    case 'APPROVED':
      return <span className="user-badge user-badge--approved">PUBLISHED</span>;
    case 'NEEDS_REVISION':
    case 'DRAFTING':
      return <span className="user-badge user-badge--revision">NEEDS REVISION</span>;
    case 'UNDER_REVIEW':
    case 'REVIEWING':
      return <span className="user-badge user-badge--review">UNDER REVIEW</span>;
    case 'DRAFT':
    case 'PROCESSING':
      return <span className="user-badge user-badge--draft">PROCESSING</span>;
    case 'REJECTED':
      return <span className="user-badge user-badge--withdrawn">REJECTED</span>;
    default:
      return <span className="user-badge">{status}</span>;
  }
}

export function AdminDashboardView() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [filter, setFilter] = useState<SubmissionStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('UPDATED');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    adminApi.overview()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load dashboard overview.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const metrics = data?.metrics || {
    submitted: 0,
    underReview: 0,
    needsRevision: 0,
    published: 0,
    rejected: 0,
    processing: 0,
    total: 0,
  };

  const queueItems = useMemo(() => data?.priorityQueue || [], [data]);

  const reviewingCount = useMemo(
    () => queueItems.filter((i) => i.status === 'REVIEWING' || i.status === 'UNDER_REVIEW').length,
    [queueItems]
  );

  const revisionCount = useMemo(
    () => queueItems.filter((i) => i.status === 'NEEDS_REVISION' || i.status === 'DRAFTING').length,
    [queueItems]
  );

  const publishedCount = useMemo(
    () => queueItems.filter((i) => i.status === 'PUBLISHED').length,
    [queueItems]
  );

  const visibleItems = useMemo(() => {
    let result = queueItems;

    if (filter === 'REVIEWING') {
      result = result.filter((i) => i.status === 'REVIEWING' || i.status === 'UNDER_REVIEW');
    } else if (filter === 'NEEDS_REVISION') {
      result = result.filter((i) => i.status === 'NEEDS_REVISION' || i.status === 'DRAFTING');
    } else if (filter === 'PUBLISHED') {
      result = result.filter((i) => i.status === 'PUBLISHED');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = item.title.toLowerCase();
        const author = (item.uploader?.name || item.uploader?.email || '').toLowerCase();
        return title.includes(q) || author.includes(q);
      });
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'TITLE') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'STATUS') {
        return a.status.localeCompare(b.status);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filter, queueItems, searchQuery, sortBy]);

  return (
    <AdminShell active="dashboard" title="Dashboard" pendingCount={metrics.underReview}>
      {/* 1. Metrics Summary Strip (Exact same student-metrics-grid as Student and Lecturer) */}
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
            <span className="student-metric-value">{loading ? <Skeleton width={32} height={24} style={{ display: 'inline-block' }} /> : metrics.total}</span>
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
            <span className="student-metric-value">{loading ? <Skeleton width={32} height={24} style={{ display: 'inline-block' }} /> : metrics.underReview}</span>
            <span className="student-metric-label">In Peer Review</span>
          </div>
        </div>

        <div className={`student-metric-card ${metrics.needsRevision > 0 ? 'student-metric-card--alert' : ''}`}>
          <div className="student-metric-icon student-metric-icon--amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{loading ? <Skeleton width={32} height={24} style={{ display: 'inline-block' }} /> : metrics.needsRevision}</span>
            <span className="student-metric-label">Needs Revision</span>
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
            <span className="student-metric-value">{loading ? <Skeleton width={32} height={24} style={{ display: 'inline-block' }} /> : metrics.published}</span>
            <span className="student-metric-label">Published</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Toolbar with Integrated Status Counts, Search, and Sort */}
      <div className="student-filter-toolbar">
        {/* Status Tab Pills */}
        <div className="student-tabs-pills" role="tablist" aria-label="Filter submission queue">
          <button
            type="button"
            className={`student-tab-pill ${filter === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All <span className="student-tab-pill__count">{queueItems.length}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'REVIEWING' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('REVIEWING')}
          >
            In Review <span className="student-tab-pill__count">{reviewingCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'NEEDS_REVISION' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => setFilter('NEEDS_REVISION')}
          >
            Needs Revision <span className="student-tab-pill__count">{revisionCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'PUBLISHED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('PUBLISHED')}
          >
            Published <span className="student-tab-pill__count">{publishedCount}</span>
          </button>
        </div>

        {/* Search & Sort on Right */}
        <div className="student-toolbar-actions">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search manuscript, author..."
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
              value={sortBy}
              onChange={(val) => setSortBy(val as SortOption)}
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

      {/* 3. Loading, Error, Empty & Table States */}
      {loading && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Editorial submissions list">
            <thead>
              <tr>
                <th>Manuscript</th>
                <th>Author</th>
                <th>Version</th>
                <th>Last Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={5} type="submissions" />
            </tbody>
          </table>
        </div>
      )}

      {!loading && error && (
        <div className="student-error" role="alert" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {!loading && !error && visibleItems.length === 0 && (
        <div className="student-empty-card">
          <div className="student-empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h3>
            {searchQuery
              ? 'No matching manuscripts found'
              : filter === 'REVIEWING'
              ? 'No manuscripts currently under review'
              : filter === 'NEEDS_REVISION'
              ? 'No manuscripts requiring revision'
              : filter === 'PUBLISHED'
              ? 'No published manuscripts recorded'
              : 'No submissions currently in queue'}
          </h3>
          <p>
            {searchQuery
              ? `No submissions match "${searchQuery}". Try searching with a different keyword.`
              : 'All preprints have been triaged and processed. New submissions will appear here automatically.'}
          </p>
        </div>
      )}

      {!loading && visibleItems.length > 0 && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Editorial submissions list">
            <thead>
              <tr>
                <th>Manuscript</th>
                <th>Author</th>
                <th>Version</th>
                <th>Last Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const authorName = item.uploader?.name || item.uploader?.email || 'Author unavailable';

                return (
                  <tr key={item.id}>
                    {/* Manuscript Title */}
                    <td className="dashboard-table__title-cell">
                      <Link
                        href={ROUTES.ADMIN.SUBMISSION_DETAIL(item.id)}
                        className="dashboard-table__title-link"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                    </td>

                    {/* Author with Email Subtext */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                          {authorName}
                        </span>
                        {item.uploader?.email ? (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#64748b',
                              fontWeight: 400,
                              lineHeight: 1.2,
                            }}
                          >
                            {item.uploader.email}
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Version */}
                    <td>
                      <span className="dashboard-version-pill">v1.0</span>
                    </td>

                    {/* Last Updated */}
                    <td className="dashboard-table__date">
                      {displayDate(item.updatedAt)}
                    </td>

                    {/* Status Badge */}
                    <td>
                      {renderStatusBadge(item.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminDashboardView;
