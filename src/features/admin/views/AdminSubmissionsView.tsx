'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminPublication, type AdminPublicationStatus } from '../api';
import type { PreprintStatus } from '@/shared/types';
import { ROUTES } from '@/app/router';

type StatusFilter = 'ALL' | AdminPublicationStatus;

function badgeStatus(status: AdminPublicationStatus): PreprintStatus {
  switch (status) {
    case 'REVIEWING':
      return 'UNDER_REVIEW';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'REJECTED';
    case 'PROCESSING':
    case 'DRAFTING':
    default:
      return 'DRAFT';
  }
}

function displayTitle(item: AdminPublication) {
  return item.title?.trim() || 'Untitled manuscript';
}

export function AdminSubmissionsView() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Awaited<ReturnType<typeof adminApi.listSubmissions>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    adminApi.listSubmissions({
      page,
      limit: 20,
      search: query.trim() || undefined,
      status: status === 'ALL' ? undefined : status,
    })
      .then((next) => {
        if (active) setResult(next);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load submissions.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, query, status]);

  const pagination = result?.pagination;

  return (
    <AdminShell active="submissions" title="Submissions">
      <AdminPageHeader
        eyebrow="Editorial queue"
        title="Submissions"
        description="Review the work entering Hyperlabdata, one version at a time."
      />

      {error && (
        <div className="user-notice" style={{ marginBottom: '20px', background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* Toolbar: Filter Tab Pills & Search Box */}
      <div className="student-filter-toolbar" style={{ marginBottom: '20px' }}>
        <div className="student-tabs-pills">
          <button
            type="button"
            className={`student-tab-pill ${status === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('ALL');
              setPage(1);
            }}
          >
            All
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'REVIEWING' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('REVIEWING');
              setPage(1);
            }}
          >
            In Review
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'DRAFTING' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('DRAFTING');
              setPage(1);
            }}
          >
            Needs Revision
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'PUBLISHED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('PUBLISHED');
              setPage(1);
            }}
          >
            Published
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'REJECTED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('REJECTED');
              setPage(1);
            }}
          >
            Rejected
          </button>
        </div>

        <div className="student-search-sort-group">
          <div className="student-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="student-search-input"
              placeholder="Search title, author or keyword..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setPage(1);
                }}
                className="student-search-clear"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Submissions Academic Table Card */}
      <div className="dashboard-table-card dashboard-table-wrapper">
        {loading ? (
          <div className="student-loading-box">
            <div className="student-spinner" />
            <p>Loading submissions queue…</p>
          </div>
        ) : !result?.items.length ? (
          <div className="student-empty-card" style={{ padding: '48px 24px' }}>
            <div className="student-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="1.75">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <h3>No submissions found</h3>
            <p>
              {query || status !== 'ALL'
                ? 'No submissions match your current filters. Try changing your search query or status tab.'
                : 'New student research submissions will appear here automatically.'}
            </p>
          </div>
        ) : (
          <table className="dashboard-table dashboard-table--repository" aria-label="Editorial submissions queue">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Manuscript</th>
                <th>Student Author</th>
                <th>Version</th>
                <th>Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => {
                const authorName = item.uploader?.name || item.uploader?.email || 'Student author unavailable';

                return (
                  <tr key={item.id}>
                    {/* Manuscript Column - Clickable Title */}
                    <td className="dashboard-table__title-cell">
                      <Link
                        href={ROUTES.ADMIN.SUBMISSION_DETAIL(item.id)}
                        className="dashboard-table__title-link"
                        title={displayTitle(item)}
                      >
                        {displayTitle(item)}
                      </Link>
                      <span className="dashboard-table__sha">
                        {item.uploader?.email || `ID: ${item.id}`}
                      </span>
                    </td>

                    {/* Student Author */}
                    <td>
                      <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#1e293b' }}>
                        {authorName}
                      </span>
                    </td>

                    {/* Version */}
                    <td>
                      <span className="dashboard-version-pill">
                        {item.currentVersion?.versionLabel ? `v${item.currentVersion.versionLabel}` : 'v1.0'}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="dashboard-table__date">
                      {new Date(item.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={badgeStatus(item.status)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Strip */}
        {pagination && pagination.totalPages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 22px',
              borderTop: '1px solid #f1f5f9',
              background: '#fcfdfe',
            }}
          >
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Page {pagination.page} of {pagination.totalPages} · {pagination.total} total submissions
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="dashboard-table__cite-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="dashboard-table__cite-btn"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default AdminSubmissionsView;
