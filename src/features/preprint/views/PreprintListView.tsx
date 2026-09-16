'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';
import type { StudentPreprint } from '../types';

export function PreprintListView() {
  const { items, loading, error } = usePreprintList();
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
        return (
          <span className="student-status-badge student-status-badge--approved">
            <span className="student-status-dot" />
            Approved
          </span>
        );
      case 'NEEDS_REVISION':
        return (
          <span className="student-status-badge student-status-badge--revision">
            <span className="student-status-dot" />
            Needs Revision
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="student-status-badge student-status-badge--review">
            <span className="student-status-dot" />
            Under Review
          </span>
        );
      case 'DRAFT':
        return (
          <span className="student-status-badge student-status-badge--draft">
            <span className="student-status-dot" />
            Draft
          </span>
        );
      case 'WITHDRAWN':
        return (
          <span className="student-status-badge student-status-badge--withdrawn">
            <span className="student-status-dot" />
            Withdrawn
          </span>
        );
      default:
        return (
          <span className="student-status-badge">
            <span className="student-status-dot" />
            {status}
          </span>
        );
    }
  };

  return (
    <StudentShell
      title="My Manuscripts"
      kicker="Author Workspace"
      actions={
        <Link href="/student/my-preprints/new" className="student-btn student-btn--primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Start a preprint</span>
        </Link>
      }
    >
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
            <span className="student-metric-label">Approved & Verified</span>
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
          <div className="student-empty-actions">
            {searchQuery || selectedTab !== 'ALL' ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedTab('ALL');
                  setSearchQuery('');
                }}
                className="student-btn student-btn--secondary"
              >
                Reset filters
              </button>
            ) : (
              <Link href="/student/my-preprints/new" className="student-btn student-btn--primary">
                Create your first preprint
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Manuscript Cards List */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="student-manuscript-feed">
          {filteredItems.map((item: StudentPreprint) => {
            const hasRevisions = item.status === 'NEEDS_REVISION';
            const latestReview = item.reviews?.[0];

            return (
              <article key={item.id} className={`student-manuscript-card ${hasRevisions ? 'student-manuscript-card--needs-revision' : ''}`}>
                {/* Header Row */}
                <div className="student-card-top">
                  <div className="student-card-meta">
                    {renderStatusBadge(item.status)}
                    <span className="student-version-tag">Version {item.current_version}</span>
                    {item.discipline && <span className="student-discipline-tag">{item.discipline}</span>}
                    {item.doi && <span className="student-doi-tag">DOI: {item.doi}</span>}
                  </div>
                  <span className="student-timestamp">
                    Updated {new Date(item.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Title and Abstract */}
                <h2 className="student-card-title">
                  <Link href={`/student/my-preprints/${item.id}`} className="student-card-title-link">
                    {item.title}
                  </Link>
                </h2>

                {item.abstract && (
                  <p className="student-card-abstract">
                    {item.abstract.length > 210 ? `${item.abstract.substring(0, 210)}…` : item.abstract}
                  </p>
                )}

                {/* Co-Authors and Supervisor Row */}
                <div className="student-card-authors-row">
                  <div className="student-card-authors">
                    <span className="student-label-prefix">Authors:</span>
                    <span className="student-authors-list">
                      {item.authors?.map((a) => a.name).join(', ') || 'Nguyen Minh An'}
                    </span>
                  </div>
                  {item.supervisor && (
                    <div className="student-card-supervisor">
                      <span className="student-label-prefix">Faculty Advisor:</span>
                      <span className="student-supervisor-name">{item.supervisor}</span>
                    </div>
                  )}
                </div>

                {/* File Attachment & Cryptographic Verification Strip */}
                {item.file_name && (
                  <div className="student-card-file-strip">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                    <span className="student-file-name">{item.file_name}</span>
                    {item.file_size && <span className="student-file-size">({item.file_size})</span>}
                    {item.sha256 && (
                      <span className="student-hash-verified" title={`SHA-256: ${item.sha256}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        SHA-256 Verified
                      </span>
                    )}
                  </div>
                )}

                {/* Revision Required Alert Banner */}
                {hasRevisions && latestReview && (
                  <div className="student-revision-banner">
                    <div className="student-revision-banner__header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      <strong>Revision Required by {latestReview.reviewer_name}:</strong>
                    </div>
                    <p className="student-revision-banner__comment">
                      &ldquo;{latestReview.comments.length > 200 ? `${latestReview.comments.substring(0, 200)}…` : latestReview.comments}&rdquo;
                    </p>
                    <div className="student-revision-banner__action">
                      <Link href={`/student/my-preprints/${item.id}/edit`} className="student-btn student-btn--warning student-btn--sm">
                        <span>Edit & Submit Revision</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Footer Action Strip */}
                <div className="student-card-footer">
                  <div className="student-card-keywords">
                    {item.keywords?.map((kw) => (
                      <span key={kw} className="student-keyword-tag">
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="student-card-actions">
                    <Link href={`/student/my-preprints/${item.id}/versions`} className="student-action-link student-action-link--secondary">
                      Versions ({item.versions?.length || 1})
                    </Link>

                    {item.status === 'DRAFT' && (
                      <Link href={`/student/my-preprints/${item.id}/edit`} className="student-action-link student-action-link--primary">
                        Continue Draft →
                      </Link>
                    )}

                    {item.status === 'NEEDS_REVISION' && (
                      <Link href={`/student/my-preprints/${item.id}/edit`} className="student-action-link student-action-link--amber">
                        Revise Draft →
                      </Link>
                    )}

                    <Link href={`/student/my-preprints/${item.id}`} className="student-action-link student-action-link--primary">
                      View Manuscript Details →
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </StudentShell>
  );
}

export default PreprintListView;
