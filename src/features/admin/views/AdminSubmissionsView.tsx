'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@hyperdata/design-system';
import { AdminPageHeader, AdminShell } from '../components';
import { adminApi, type AdminPublication, type AdminPublicationStatus, type AdminOverview } from '../api';
import { TableSkeleton } from '@/components/skeleton';
import type { PreprintStatus } from '@/shared/types';
import { ROUTES } from '@/app/router';
import { useTranslation } from '@/i18n';

type StatusFilter = 'ALL' | AdminPublicationStatus;
type RoleFilter = 'ALL' | 'LECTURER' | 'STUDENT';

function badgeStatus(status: AdminPublicationStatus): PreprintStatus {
  switch (status) {
    case 'REVIEWING':
      return 'UNDER_REVIEW';
    case 'PUBLISHED':
      return 'PUBLISHED';
    case 'REJECTED':
      return 'REJECTED';
    case 'DRAFTING':
      return 'NEEDS_REVISION';
    case 'PROCESSING':
    default:
      return 'DRAFT';
  }
}

function formatVersionLabel(versionLabel?: string | null, versionNumber?: number | null) {
  if (versionLabel) {
    return versionLabel.startsWith('v') ? versionLabel : `v${versionLabel}`;
  }
  if (typeof versionNumber === 'number') {
    return `v${versionNumber}`;
  }
  return 'v1.0';
}

function displayTitle(item: AdminPublication) {
  return item.title?.trim() || 'Untitled manuscript';
}

export function AdminSubmissionsView() {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Awaited<ReturnType<typeof adminApi.listSubmissions>> | null>(null);
  const [metrics, setMetrics] = useState<AdminOverview['metrics'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch overview metrics for top cards & status pills count
  useEffect(() => {
    let active = true;
    adminApi
      .overview()
      .then((res) => {
        if (active && res?.metrics) {
          setMetrics(res.metrics);
        }
      })
      .catch(() => {
        // Soft-fail: metrics are complementary, table still loads
      });

    return () => {
      active = false;
    };
  }, []);

  // Fetch submissions list whenever page, query, status, or roleFilter changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    adminApi
      .listSubmissions({
        page,
        limit: 20,
        search: query.trim() || undefined,
        status: status === 'ALL' ? undefined : status,
        uploaderRole: roleFilter === 'ALL' ? undefined : roleFilter,
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
  }, [page, query, status, roleFilter]);

  const displayMetrics = metrics || {
    submitted: 0,
    underReview: 0,
    needsRevision: 0,
    published: 0,
    rejected: 0,
    processing: 0,
    facultySubmissions: 0,
    studentSubmissions: 0,
    total: result?.pagination?.total || 0,
  };

  const pagination = result?.pagination;

  return (
    <AdminShell active="submissions" title="Submissions" pendingCount={displayMetrics.underReview}>
      <AdminPageHeader
        eyebrow={t('admin.editorialWorkspace')}
        title={t('admin.submissionsManagement')}
        description={t('admin.submissionsDesc')}
      />

      {error && (
        <div className="user-notice" style={{ marginBottom: '20px', background: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
          {error}
        </div>
      )}

      {/* 1. Metrics Grid */}
      <div className="student-metrics-grid" style={{ marginBottom: '24px' }}>
        <div
          className={`student-metric-card ${status === 'ALL' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setStatus('ALL');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
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
            <span className="student-metric-value">{displayMetrics.total}</span>
            <span className="student-metric-label">{t('admin.totalManuscripts')}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${status === 'REVIEWING' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setStatus('REVIEWING');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{displayMetrics.underReview}</span>
            <span className="student-metric-label">{t('admin.inReview')}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${displayMetrics.needsRevision > 0 ? 'student-metric-card--alert' : ''} ${status === 'DRAFTING' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setStatus('DRAFTING');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: displayMetrics.needsRevision > 0 ? '#d97706' : undefined }}>
              {displayMetrics.needsRevision}
            </span>
            <span className="student-metric-label">{t('admin.needsRevision')}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${status === 'PUBLISHED' ? 'student-metric-card--active' : ''}`}
          onClick={() => {
            setStatus('PUBLISHED');
            setPage(1);
          }}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: '#16a34a' }}>{displayMetrics.published}</span>
            <span className="student-metric-label">{t('admin.published')}</span>
          </div>
        </div>
      </div>

      {/* Submitter Category Tabs (All / Faculty / Student) - System Style */}
      <div className="student-filter-toolbar" style={{ marginBottom: '14px' }}>
        <div className="student-tabs-pills" role="tablist" aria-label="Filter submissions by submitter category">
          <button
            type="button"
            className={`student-tab-pill ${roleFilter === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleFilter('ALL');
              setPage(1);
            }}
          >
            {t('admin.submissions')} <span className="student-tab-pill__count">{displayMetrics.total}</span>
          </button>

          <button
            type="button"
            className={`student-tab-pill ${roleFilter === 'LECTURER' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleFilter('LECTURER');
              setPage(1);
            }}
          >
            {t('admin.lecturers')} <span className="student-tab-pill__count">{displayMetrics.facultySubmissions ?? 0}</span>
          </button>

          <button
            type="button"
            className={`student-tab-pill ${roleFilter === 'STUDENT' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setRoleFilter('STUDENT');
              setPage(1);
            }}
          >
            {t('admin.students')} <span className="student-tab-pill__count">{displayMetrics.studentSubmissions ?? 0}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Toolbar: Filter Tab Pills & Search Box */}
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
            {t('common.all')} <span className="student-tab-pill__count">{displayMetrics.total}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'REVIEWING' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('REVIEWING');
              setPage(1);
            }}
          >
            {t('admin.inReview')} <span className="student-tab-pill__count">{displayMetrics.underReview}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'DRAFTING' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('DRAFTING');
              setPage(1);
            }}
          >
            {t('admin.needsRevision')} <span className="student-tab-pill__count">{displayMetrics.needsRevision}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'PUBLISHED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('PUBLISHED');
              setPage(1);
            }}
          >
            {t('admin.published')} <span className="student-tab-pill__count">{displayMetrics.published}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${status === 'REJECTED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => {
              setStatus('REJECTED');
              setPage(1);
            }}
          >
            {t('admin.rejected')} <span className="student-tab-pill__count">{displayMetrics.rejected}</span>
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
              placeholder={t('admin.searchSubmissions')}
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
                aria-label={t('admin.clearSearch')}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Submissions Academic Table Card */}
      <div className="dashboard-table-card dashboard-table-wrapper">
        {loading ? (
          <table className="dashboard-table dashboard-table--repository" aria-label="Editorial submissions queue">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>{t('admin.titleAndVersion')}</th>
                <th>{t('admin.author')}</th>
                <th>{t('nav.versions')}</th>
                <th>{t('admin.submittedDate')}</th>
                <th>{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={6} type="submissions" />
            </tbody>
          </table>
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
            <h3>{t('admin.noSubmissions')}</h3>
            <p>
              {query || status !== 'ALL' || roleFilter !== 'ALL'
                ? (locale === 'vi'
                    ? 'Không có bản thảo nào khớp với bộ lọc hiện tại. Hãy thử thay đổi từ khóa tìm kiếm hoặc tab trạng thái.'
                    : 'No submissions match your current filters. Try changing your search query, status tab, or author role tab.')
                : (locale === 'vi'
                    ? 'Các bản thảo nghiên cứu mới sẽ tự động hiển thị tại đây.'
                    : 'New research submissions will appear here automatically.')}
            </p>
          </div>
        ) : (
          <table className="dashboard-table dashboard-table--repository" aria-label="Editorial submissions queue">
            <thead>
              <tr>
                <th style={{ width: '45%' }}>{t('admin.titleAndVersion')}</th>
                <th>{t('admin.author')}</th>
                <th>{t('nav.versions')}</th>
                <th>{t('admin.submittedDate')}</th>
                <th>{t('common.status')}</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => {
                const authorName = item.uploader?.name || item.uploader?.email || (locale === 'vi' ? 'Không có tên tác giả' : 'Author unavailable');

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
                      <span className="dashboard-version-pill">
                        {formatVersionLabel(item.currentVersion?.versionLabel, item.currentVersion?.version)}
                      </span>
                    </td>

                    {/* Updated */}
                    <td className="dashboard-table__date">
                      {new Date(item.updatedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US', {
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
              {t('admin.pageOf', { page: pagination.page, totalPages: pagination.totalPages })} · {t('admin.totalSubmissionsNum', { total: pagination.total })}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="dashboard-table__cite-btn"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => current - 1)}
              >
                {t('common.previous')}
              </button>
              <button
                type="button"
                className="dashboard-table__cite-btn"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((current) => current + 1)}
              >
                {t('common.next')}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default AdminSubmissionsView;
