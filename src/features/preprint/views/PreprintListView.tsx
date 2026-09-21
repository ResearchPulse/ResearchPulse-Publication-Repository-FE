'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { StudentShell } from '../components';
import { TableSkeleton } from '@/components/skeleton';
import { SortDropdown } from '@/components/sort-dropdown';
import { usePreprintList } from '../hooks';
import type { PreprintStatus } from '@/shared/types';
import type { StudentPreprint } from '../types';
import { useTranslation } from '@/i18n';

function formatUpdatedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Vừa cập nhật';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function PreprintListView() {
  const { t, locale } = useTranslation();
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
        return <span className="user-badge user-badge--approved">{t('student.preprints.published').toUpperCase()}</span>;
      case 'APPROVED':
        return <span className="user-badge user-badge--approved">{t('student.preprints.accepted').toUpperCase()}</span>;
      case 'NEEDS_REVISION':
        return <span className="user-badge user-badge--revision">{t('student.preprints.revisionNeeded').toUpperCase()}</span>;
      case 'UNDER_REVIEW':
        return <span className="user-badge user-badge--review">{t('student.preprints.underReview').toUpperCase()}</span>;
      case 'DRAFT':
        return <span className="user-badge user-badge--draft">{t('student.preprints.draft').toUpperCase()}</span>;
      case 'WITHDRAWN':
      case 'REJECTED':
        return <span className="user-badge user-badge--withdrawn">{t('student.preprints.rejected').toUpperCase()}</span>;
      default:
        return <span className="user-badge">{status}</span>;
    }
  };

  return (
    <StudentShell title={t('nav.myPreprints')} showStandardHeader={false}>
      {/* Notice Banner */}
      {apiPending && (
        <div className="user-notice" style={{ marginTop: '0', marginBottom: '20px' }}>
          {t('student.preprints.serverDelay')}
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
              <strong className="dashboard-alert-banner__title">{t('student.preprints.actionRequired')}</strong>
              <span className="dashboard-alert-banner__badge">{t('student.preprints.versionBadge', { version: revisionItem.current_version })}</span>
            </div>
            <p className="dashboard-alert-banner__desc">
              {t('student.preprints.revisionDesc1')} <strong>{revisionItem.reviews?.[0]?.reviewer_name || t('student.preprints.reviewBoard')}</strong> {t('student.preprints.revisionDesc2')} <em>&ldquo;{revisionItem.title}&rdquo;</em>.
            </p>
          </div>
          <div className="dashboard-alert-banner__action">
            <Link
              href={`/student/my-preprints/${revisionItem.id}`}
              className="dashboard-alert-banner__btn"
            >
              {t('student.preprints.viewFeedback')}
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="student-metrics-grid">
        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.total}</span>
            <span className="student-metric-label">{t('student.preprints.totalCount')}</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.underReview}</span>
            <span className="student-metric-label">{t('student.preprints.underReview')}</span>
          </div>
        </div>

        <div className="student-metric-card student-metric-card--alert">
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.needsRevision}</span>
            <span className="student-metric-label">{t('student.preprints.needsRevision')}</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.approved}</span>
            <span className="student-metric-label">{t('student.preprints.approved')}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="student-filter-toolbar">
        {/* Status Tabs */}
        <div className="student-tabs-pills" role="tablist" aria-label={t('student.preprints.filterStatus')}>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('ALL')}
          >
            {t('common.all')} <span className="student-tab-pill__count">{metrics.total}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'UNDER_REVIEW' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('UNDER_REVIEW')}
          >
            {t('student.preprints.underReview')} <span className="student-tab-pill__count">{metrics.underReview}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'NEEDS_REVISION' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => setSelectedTab('NEEDS_REVISION')}
          >
            {t('student.preprints.needsRevision')} <span className="student-tab-pill__count">{metrics.needsRevision}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'APPROVED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('APPROVED')}
          >
            {t('student.preprints.approved')} <span className="student-tab-pill__count">{metrics.approved}</span>
          </button>
          {metrics.drafts > 0 && (
            <button
              type="button"
              className={`student-tab-pill ${selectedTab === 'DRAFT' ? 'student-tab-pill--active' : ''}`}
              onClick={() => setSelectedTab('DRAFT')}
            >
              {t('student.preprints.draft')} <span className="student-tab-pill__count">{metrics.drafts}</span>
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
              placeholder={t('common.searchPreprints')}
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
            <span className="student-sort-label">{t('common.sortBy')}</span>
            <SortDropdown
              value={safeSortBy}
              onChange={(val) => setSortBy(val as 'UPDATED' | 'TITLE' | 'STATUS')}
              options={[
                { value: 'UPDATED', label: t('common.recentlyUpdated') },
                { value: 'TITLE', label: t('common.titleAZ') },
                { value: 'STATUS', label: t('common.byStatus') },
              ]}
              style={{ width: '160px' }}
            />
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Danh sách kho bản thảo">
            <thead>
              <tr>
                <th style={{ width: '48%' }}>{t('student.preprints.tableManuscript')}</th>
                <th>{t('student.preprints.tableDiscipline')}</th>
                <th>{t('student.preprints.tableVersion')}</th>
                <th>{t('student.preprints.tableStatus')}</th>
                <th>{t('student.preprints.tableUpdated')}</th>
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
          <strong>Lỗi khi tải bản thảo:</strong> {error.message}
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
          <h3>{t('student.preprints.emptyTitle')}</h3>
          <p>
            {searchQuery || selectedTab !== 'ALL'
              ? (locale === 'vi' ? 'Không có bản thảo nào khớp với bộ lọc hiện tại. Hãy thử thay đổi từ khóa tìm kiếm hoặc tab trạng thái.' : 'No preprints match your current filters. Try changing your search query or status tab.')
              : (locale === 'vi' ? 'Bạn chưa nộp bản thảo nào. Hãy bắt đầu nộp bản thảo nghiên cứu đầu tiên để được cấp mã băm xác thực và nhận sự hướng dẫn từ giảng viên.' : 'You have not submitted any preprints yet. Start by submitting your first research manuscript.')}
          </p>
        </div>
      )}

      {/* Manuscripts Table View */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Danh sách kho bản thảo">
            <thead>
              <tr>
                <th style={{ width: '48%' }}>{t('student.preprints.tableManuscript')}</th>
                <th>{t('student.preprints.tableDiscipline')}</th>
                <th>{t('student.preprints.tableVersion')}</th>
                <th>{t('student.preprints.tableStatus')}</th>
                <th>{t('student.preprints.tableUpdated')}</th>
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
                        <span className="dashboard-private-pill">Bảo mật</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="dashboard-badge-tag">{item.discipline || (locale === 'vi' ? 'Tổng quát' : 'General')}</span>
                  </td>
                  <td>
                    <span className="dashboard-version-pill">v{item.current_version}</span>
                  </td>
                  <td>
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="dashboard-table__date">
                    {(() => {
                      const date = new Date(item.updated_at);
                      if (Number.isNaN(date.getTime())) return locale === 'vi' ? 'Vừa cập nhật' : 'Just updated';
                      return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      }).format(date);
                    })()}
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
