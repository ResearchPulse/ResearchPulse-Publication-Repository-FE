'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/app/router';
import { LecturerShell } from '../components';
import { TableSkeleton } from '@/components/skeleton';
import { lecturerReviewApi, type LecturerReviewItem } from '../api';

type QueueFilter = 'ALL' | 'AWAITING_REVIEW' | 'COMPLETED';
type SortOption = 'UPDATED' | 'TITLE' | 'STATUS';

function displayTitle(item: LecturerReviewItem) {
  let raw = item.title?.trim() || item.currentVersion?.fileName || item.objectKey.split('/').pop() || 'Untitled manuscript';
  // Strip common GROBID publisher/licensing noise if extracted into title
  if (raw.includes('Provided proper attribution is provided') && raw.includes('Attention Is All You Need')) {
    raw = 'Attention Is All You Need';
  } else if (raw.startsWith('Provided proper attribution is provided') && raw.length > 100) {
    const parts = raw.split('. ');
    if (parts.length > 1) {
      raw = parts[parts.length - 1].trim();
    }
  }
  return raw;
}

function displayDate(value?: string) {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}

export function LecturerReviewsView() {
  const [items, setItems] = useState<LecturerReviewItem[]>([]);
  const [filter, setFilter] = useState<QueueFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('UPDATED');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    lecturerReviewApi.list()
      .then((result) => { if (active) setItems(result.items); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load the review queue.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const pendingCount = useMemo(
    () => items.filter((item) => item.reviewStatus === 'AWAITING_REVIEW').length,
    [items],
  );

  const completedCount = useMemo(
    () => items.filter((item) => item.reviewStatus === 'COMPLETED').length,
    [items],
  );

  const visibleItems = useMemo(() => {
    let result = items;

    if (filter !== 'ALL') {
      result = result.filter((item) => item.reviewStatus === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        const title = displayTitle(item).toLowerCase();
        const author = (item.uploader?.name || item.uploader?.email || '').toLowerCase();
        const doi = (item.doi || '').toLowerCase();
        return title.includes(q) || author.includes(q) || doi.includes(q);
      });
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'TITLE') {
        return displayTitle(a).localeCompare(displayTitle(b));
      }
      if (sortBy === 'STATUS') {
        return a.reviewStatus.localeCompare(b.reviewStatus);
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filter, items, searchQuery, sortBy]);

  return (
    <LecturerShell active="reviews" title="Review queue" pendingCount={pendingCount}>
      {/* Filter Toolbar with Integrated Counts, Search, and Sort */}
      <div className="student-filter-toolbar">
        {/* Status Tab Pills */}
        <div className="student-tabs-pills" role="tablist" aria-label="Filter review queue">
          <button
            type="button"
            className={`student-tab-pill ${filter === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All <span className="student-tab-pill__count">{items.length}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'AWAITING_REVIEW' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => setFilter('AWAITING_REVIEW')}
          >
            Awaiting Review <span className="student-tab-pill__count">{pendingCount}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${filter === 'COMPLETED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setFilter('COMPLETED')}
          >
            Completed <span className="student-tab-pill__count">{completedCount}</span>
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="student-sort-select"
            >
              <option value="UPDATED">Recently Updated</option>
              <option value="TITLE">Title (A-Z)</option>
              <option value="STATUS">Review Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Loading, Error, Empty & Table States */}
      {loading && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Available review manuscripts list">
            <thead>
              <tr>
                <th style={{ width: '48%' }}>Manuscript</th>
                <th>Author</th>
                <th>Version</th>
                <th>Review SLA</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={5} type="reviews" />
            </tbody>
          </table>
        </div>
      )}

      {!loading && error && (
        <div className="student-error" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && visibleItems.length === 0 && (
        <div className="student-empty-card">
          <div className="student-empty-icon">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3>
            {searchQuery
              ? 'No matching manuscripts found'
              : filter === 'AWAITING_REVIEW'
              ? 'No manuscripts awaiting review'
              : filter === 'COMPLETED'
              ? 'No completed reviews recorded'
              : 'No manuscripts currently available for review'}
          </h3>
          <p>
            {searchQuery
              ? `No available manuscripts match "${searchQuery}". Try a different keyword.`
              : filter === 'AWAITING_REVIEW'
              ? 'All available reviews have been submitted. Thank you for your thorough peer mentorship!'
              : 'Submitted preprints in REVIEWING status will appear here for faculty review.'}
          </p>
        </div>
      )}

      {!loading && !error && visibleItems.length > 0 && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Available review manuscripts list">
            <thead>
              <tr>
                <th style={{ width: '48%' }}>Manuscript</th>
                <th>Author</th>
                <th>Version</th>
                <th>Review SLA</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => {
                const isPending = item.reviewStatus === 'AWAITING_REVIEW';
                const cleanTitle = displayTitle(item);
                const authorName = item.uploader?.name || 'Anonymous Author';

                return (
                  <tr key={item.id}>
                    {/* Manuscript Info */}
                    <td>
                      <Link
                        href={ROUTES.LECTURER.REVIEW_DETAIL(item.id)}
                        className="dashboard-table__title-link"
                        style={{ fontWeight: 700, fontSize: '14.5px', color: '#0f172a', lineHeight: 1.4 }}
                        title={cleanTitle}
                      >
                        {cleanTitle}
                      </Link>
                    </td>

                    {/* Author (Student visible, Faculty Double-Blind) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                          {authorName}
                        </span>
                        {item.uploader?.role === 'LECTURER' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            Double-Blind
                          </span>
                        ) : item.uploader?.email ? (
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
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                        v{item.currentVersion?.version || 1}.0
                      </span>
                    </td>

                    {/* Review SLA / Updated */}
                    <td>
                      {isPending ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#d97706', fontSize: '12.5px', fontWeight: 600 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>48h SLA Active</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontSize: '12.5px', fontWeight: 600 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>Completed</span>
                        </div>
                      )}
                      <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        Updated {displayDate(item.updatedAt)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ textAlign: 'right' }}>
                      <span className={`user-badge ${isPending ? 'user-badge--revision' : 'user-badge--approved'}`}>
                        {isPending ? 'AWAITING REVIEW' : 'COMPLETED'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </LecturerShell>
  );
}

export default LecturerReviewsView;
