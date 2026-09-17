'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';
import type { StudentPreprint } from '../types';

export function PreprintListView() {
  const { items, loading, error, apiPending } = usePreprintList();
  const [selectedTab, setSelectedTab] = useState<'ALL' | PreprintStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'UPDATED' | 'TITLE' | 'STATUS'>('UPDATED');

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = items.length;
    const underReview = items.filter((i) => i.status === 'UNDER_REVIEW').length;
    const needsRevision = items.filter((i) => i.status === 'NEEDS_REVISION').length;
    const approved = items.filter((i) => i.status === 'APPROVED' || i.status === 'PUBLISHED').length;
    const drafts = items.filter((i) => i.status === 'DRAFT').length;
    return { total, underReview, needsRevision, approved, drafts };
  }, [items]);

  // Filtered and sorted manuscripts
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedTab !== 'ALL' && item.status !== selectedTab) return false;
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
        if (sortBy === 'TITLE') return a.title.localeCompare(b.title);
        if (sortBy === 'STATUS') return a.status.localeCompare(b.status);
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
  }, [items, selectedTab, searchQuery, sortBy]);

  const renderStatusBadge = (status: PreprintStatus) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return <span className="user-badge user-badge--approved">APPROVED</span>;
      case 'NEEDS_REVISION':
        return <span className="user-badge user-badge--revision">NEEDS REVISION</span>;
      case 'UNDER_REVIEW':
        return <span className="user-badge user-badge--review">UNDER REVIEW</span>;
      case 'DRAFT':
        return <span className="user-badge user-badge--draft">DRAFT</span>;
      case 'WITHDRAWN':
        return <span className="user-badge user-badge--withdrawn">WITHDRAWN</span>;
      default:
        return <span className="user-badge">{status}</span>;
    }
  };

  return (
    <StudentShell title="My Manuscripts" showStandardHeader={false}>
      {/* Dashboard Page Header */}
      <div className="dashboard-page-header">
        <div className="dashboard-page-header__left">
          <span className="dashboard-hero__eyebrow">MANUSCRIPT REPOSITORY</span>
          <h1 className="dashboard-hero__title" style={{ fontSize: '24px', margin: '0 0 6px' }}>My Manuscripts</h1>
          <p className="dashboard-hero__subtitle" style={{ margin: 0 }}>
            Prepare, revise, and track your preprints in the Hyperdata Lab repository.
          </p>
        </div>
        <div className="dashboard-page-header__right">
          <Link href="/student/my-preprints/new" className="dashboard-btn dashboard-btn--primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Start a Submission</span>
          </Link>
        </div>
      </div>

      {/* Notice Banner */}
      {apiPending && (
        <div className="user-notice" style={{ marginTop: '16px', marginBottom: '20px' }}>
          Preprint API is unavailable, so preview data is shown. Your work is not affected.
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
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'UPDATED' | 'TITLE' | 'STATUS')}
              className="student-sort-select"
            >
              <option value="UPDATED">Recently Updated</option>
              <option value="TITLE">Title (A-Z)</option>
              <option value="STATUS">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="student-loading-box">
          <div className="student-spinner" />
          <p>Loading your manuscripts from repository…</p>
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

      {/* 2-Column Card Grid matching user screenshot */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="user-grid">
          {filteredItems.map((item: StudentPreprint) => {
            const hasRevisions = item.status === 'NEEDS_REVISION';
            const latestReview = item.reviews?.[0];

            return (
              <div key={item.id} className={`user-card ${hasRevisions ? 'user-card--needs-revision' : ''}`}>
                {/* Top: Status badge on left, Version on right */}
                <div className="user-card__top">
                  {renderStatusBadge(item.status)}
                  <span className="user-card__version">v{item.current_version}</span>
                </div>

                {/* Middle: Title & Abstract matching user screenshot */}
                <div className="user-card__body">
                  <h2 className="user-card__title">
                    <Link href={`/student/my-preprints/${item.id}`} className="user-card__title-link">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="user-card__abstract">
                    {item.abstract ? item.abstract : 'No abstract provided.'}
                  </p>
                </div>

                {/* Bottom: Preview item on left, Open -> on right */}
                <div className="user-card__bottom">
                  <Link href={`/student/my-preprints/${item.id}`} className="user-card__preview-label">
                    Preview item
                  </Link>
                  <div className="user-card__bottom-actions">
                    <Link href={`/student/my-preprints/${item.id}`} className="user-card__link">
                      Open →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </StudentShell>
  );
}

export default PreprintListView;
