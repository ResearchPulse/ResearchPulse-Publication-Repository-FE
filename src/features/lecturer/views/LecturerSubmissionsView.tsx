'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LecturerShell } from '../components';
import { usePreprintList } from '@/features/preprint/hooks';
import type { PreprintStatus } from '@/shared/types';
import type { StudentPreprint } from '@/features/preprint/types';
import { ROUTES } from '@/app/router';
import { TableSkeleton } from '@/components/skeleton';
import { SortDropdown } from '@/components/sort-dropdown';
import { studentPreprintApi } from '@/features/preprint/api';
import { useTranslation } from '@/i18n';

function formatUpdatedDate(value: string, locale: string = 'en') {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return locale === 'vi' ? 'Vừa cập nhật' : 'Recently updated';

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function LecturerSubmissionsView() {
  const { t, locale } = useTranslation();
  const searchParams = useSearchParams();
  const { items, loading, error, apiPending, refetch } = usePreprintList();
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'PRIVATE' | PreprintStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || searchParams?.get('q') || '');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<StudentPreprint | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleDeleteDraft = async (item: StudentPreprint) => {
    if (item.status !== 'DRAFT') return;
    try {
      setDeletingId(item.id);
      setActionError(null);
      await studentPreprintApi.delete(item.id);
      setActionSuccess(t('student.preprints.deleteSuccess'));
      setDeleteConfirmItem(null);
      await refetch();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : (locale === 'vi' ? 'Lỗi khi xóa bản nháp.' : 'Failed to delete draft.'));
    } finally {
      setDeletingId(null);
    }
  };


  // 1. Sync from URL
  useEffect(() => {
    const q = searchParams?.get('search') || searchParams?.get('q') || '';
    setSearchQuery(q);
  }, [searchParams]);

  // 2. Bi-directional sync with Topbar
  useEffect(() => {
    const handleSearchChange = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (typeof customEvent.detail === 'string') {
        setSearchQuery(customEvent.detail);
      }
    };
    window.addEventListener('lecturer-search-change', handleSearchChange);
    return () => window.removeEventListener('lecturer-search-change', handleSearchChange);
  }, []);

  const handleToolbarSearchChange = (val: string) => {
    setSearchQuery(val);
    window.dispatchEvent(new CustomEvent('lecturer-search-change', { detail: val }));
    const newUrl = val.trim() ? `/lecturer/submissions?search=${encodeURIComponent(val.trim())}` : '/lecturer/submissions';
    window.history.replaceState(null, '', newUrl);
  };

  const [sortBy, setSortBy] = useState('UPDATED');
  const safeSortBy = sortBy;

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = items.length;
    const underReview = items.filter((i) => i.status === 'UNDER_REVIEW').length;
    const needsRevision = items.filter((i) => i.status === 'NEEDS_REVISION').length;
    const approved = items.filter((i) => i.status === 'APPROVED' || i.status === 'PUBLISHED').length;
    const drafts = items.filter((i) => i.status === 'DRAFT').length;
    const privateCount = items.filter((i) => i.is_private === true).length;
    return { total, underReview, needsRevision, approved, drafts, privateCount };
  }, [items]);

  // Needs revision item for priority callout
  const revisionItem = useMemo(() => {
    return items.find((i) => i.status === 'NEEDS_REVISION');
  }, [items]);

  // Filtered and sorted manuscripts
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedTab === 'PRIVATE') {
          if (!item.is_private) return false;
        } else if (selectedTab !== 'ALL') {
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
        if (safeSortBy === 'TITLE') {
          return (a.title || '').localeCompare(b.title || '');
        }
        if (safeSortBy === 'STATUS') {
          return (a.status || '').localeCompare(b.status || '');
        }
        const timeA = new Date(a.updated_at || 0).getTime();
        const timeB = new Date(b.updated_at || 0).getTime();
        return timeB - timeA;
      });
  }, [items, selectedTab, searchQuery, safeSortBy]);

  const renderStatusBadge = (status: PreprintStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="user-badge user-badge--approved">{locale === 'vi' ? 'ĐÃ XUẤT BẢN' : 'PUBLISHED'}</span>;
      case 'APPROVED':
        return <span className="user-badge user-badge--approved">{locale === 'vi' ? 'ĐÃ DUYỆT' : 'APPROVED'}</span>;
      case 'NEEDS_REVISION':
        return <span className="user-badge user-badge--revision">{locale === 'vi' ? 'CẦN CHỈNH SỬA' : 'NEEDS REVISION'}</span>;
      case 'UNDER_REVIEW':
        return <span className="user-badge user-badge--review">{locale === 'vi' ? 'ĐANG THẨM ĐỊNH' : 'UNDER REVIEW'}</span>;
      case 'DRAFT':
        return <span className="user-badge user-badge--draft">{locale === 'vi' ? 'BẢN NHÁP' : 'DRAFT'}</span>;
      case 'WITHDRAWN':
      case 'REJECTED':
        return <span className="user-badge user-badge--withdrawn">{locale === 'vi' ? 'BỊ TỪ CHỐI' : 'REJECTED'}</span>;
      default:
        return <span className="user-badge">{status}</span>;
    }
  };

  return (
    <LecturerShell active="submissions" title={locale === 'vi' ? 'Bản thảo của tôi' : 'My Manuscripts'}>
      {/* Notice Banner */}
      {apiPending && (
        <div className="user-notice" style={{ marginTop: '0', marginBottom: '20px' }}>
          {locale === 'vi'
            ? 'Dịch vụ kho lưu trữ tạm thời gián đoạn, đang hiển thị dữ liệu xem trước.'
            : 'Repository service is temporarily unreachable, preview data shown.'}
        </div>
      )}

      {actionSuccess && (
        <div className="user-notice" style={{ marginTop: '0', marginBottom: '20px', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="student-error-banner" style={{ marginTop: '0', marginBottom: '20px' }}>
          <strong>Lỗi:</strong> {actionError}
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
              <strong className="dashboard-alert-banner__title">
                {locale === 'vi' ? 'Yêu cầu hành động: Cần cập nhật chỉnh sửa' : 'Action Required: Revision Requested'}
              </strong>
              <span className="dashboard-alert-banner__badge">
                {locale === 'vi' ? `Phiên bản ${revisionItem.current_version}` : `Version ${revisionItem.current_version}`}
              </span>
            </div>
            <p className="dashboard-alert-banner__desc">
              {locale === 'vi' ? (
                <>Hội đồng thẩm định yêu cầu bổ sung chỉnh sửa đối với <em>&ldquo;{revisionItem.title}&rdquo;</em>.</>
              ) : (
                <>Review team requested revision updates on <em>&ldquo;{revisionItem.title}&rdquo;</em>.</>
              )}
            </p>
          </div>
          <div className="dashboard-alert-banner__action">
            <Link
              href={`${ROUTES.LECTURER.NEW_SUBMISSION}?id=${revisionItem.id}`}
              className="dashboard-alert-banner__btn"
            >
              {locale === 'vi' ? 'Xem & Chỉnh sửa →' : 'Review & Revise →'}
            </Link>
          </div>
        </div>
      )}

      {/* Metrics Summary Strip */}
      <div className="student-metrics-grid">
        <div
          className={`student-metric-card ${selectedTab === 'ALL' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedTab('ALL')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
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
            <span className="student-metric-label">{locale === 'vi' ? 'Tổng số bản thảo' : 'Total Manuscripts'}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${selectedTab === 'UNDER_REVIEW' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedTab('UNDER_REVIEW')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon student-metric-icon--orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value">{metrics.underReview}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Đang thẩm định' : 'In Peer Review'}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${metrics.needsRevision > 0 ? 'student-metric-card--alert' : ''} ${selectedTab === 'NEEDS_REVISION' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedTab('NEEDS_REVISION')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon student-metric-icon--amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: metrics.needsRevision > 0 ? '#d97706' : undefined }}>
              {metrics.needsRevision}
            </span>
            <span className="student-metric-label">{locale === 'vi' ? 'Cần chỉnh sửa' : 'Needs Revision'}</span>
          </div>
        </div>

        <div
          className={`student-metric-card ${selectedTab === 'APPROVED' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedTab('APPROVED')}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon student-metric-icon--green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="student-metric-info">
            <span className="student-metric-value" style={{ color: '#16a34a' }}>{metrics.approved}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Đã xuất bản' : 'Published'}</span>
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
            {t('common.all')} <span className="student-tab-pill__count">{metrics.total}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'UNDER_REVIEW' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('UNDER_REVIEW')}
          >
            {locale === 'vi' ? 'Đang thẩm định' : 'Under Review'} <span className="student-tab-pill__count">{metrics.underReview}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'NEEDS_REVISION' ? 'student-tab-pill--active student-tab-pill--alert' : ''}`}
            onClick={() => setSelectedTab('NEEDS_REVISION')}
          >
            {locale === 'vi' ? 'Cần chỉnh sửa' : 'Needs Revision'} <span className="student-tab-pill__count">{metrics.needsRevision}</span>
          </button>
          <button
            type="button"
            className={`student-tab-pill ${selectedTab === 'APPROVED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedTab('APPROVED')}
          >
            {locale === 'vi' ? 'Đã duyệt' : 'Approved'} <span className="student-tab-pill__count">{metrics.approved}</span>
          </button>
          {metrics.drafts > 0 && (
            <button
              type="button"
              className={`student-tab-pill ${selectedTab === 'DRAFT' ? 'student-tab-pill--active' : ''}`}
              onClick={() => setSelectedTab('DRAFT')}
            >
              {locale === 'vi' ? 'Bản nháp' : 'Draft'} <span className="student-tab-pill__count">{metrics.drafts}</span>
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
              type="text"
              placeholder={t('common.searchManuscripts')}
              value={searchQuery}
              onChange={(e) => handleToolbarSearchChange(e.target.value)}
              className="student-search-input"
            />
            {searchQuery && (
              <button type="button" onClick={() => handleToolbarSearchChange('')} className="student-search-clear">
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
          <table className="dashboard-table dashboard-table--repository" aria-label="Faculty manuscripts repository list">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>{locale === 'vi' ? 'Bản thảo' : 'Manuscript'}</th>
                <th>{locale === 'vi' ? 'Chuyên ngành' : 'Discipline'}</th>
                <th>{locale === 'vi' ? 'Phiên bản' : 'Version'}</th>
                <th>{locale === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th>{locale === 'vi' ? 'Cập nhật' : 'Updated'}</th>
                <th style={{ textAlign: 'right' }}>{locale === 'vi' ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              <TableSkeleton rows={5} columns={6} type="submissions" />
            </tbody>
          </table>
        </div>
      )}

      {error && !loading && (
        <div className="student-error-banner">
          <strong>{locale === 'vi' ? 'Lỗi tải bản thảo:' : 'Error loading manuscripts:'}</strong> {error.message}
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
          <h3>{locale === 'vi' ? 'Không tìm thấy bản thảo nào' : 'No manuscripts found'}</h3>
          <p style={{ maxWidth: '480px', margin: '0 auto 16px', color: '#64748b' }}>
            {searchQuery || selectedTab !== 'ALL'
              ? (locale === 'vi'
                ? 'Không có bản thảo nào khớp với bộ lọc tìm kiếm. Hãy thử từ khóa khác hoặc chuyển tab trạng thái.'
                : 'No manuscripts match your current filters. Try changing your search query or status tab.')
              : (locale === 'vi'
                ? 'Bạn chưa nộp bản thảo nào. Hãy bắt đầu nộp bản thảo nghiên cứu mới ngay hôm nay.'
                : 'You have not submitted any manuscripts yet. Start a new submission or store private preprints in your faculty archive.')}
          </p>
          <Link href={ROUTES.LECTURER.NEW_SUBMISSION} className="student-btn student-btn--primary">
            {locale === 'vi' ? '+ Nộp bản thảo mới' : '+ New Submission'}
          </Link>
        </div>
      )}

      {/* Manuscripts Table View */}
      {!loading && !error && filteredItems.length > 0 && (
        <div className="dashboard-table-card dashboard-table-wrapper">
          <table className="dashboard-table dashboard-table--repository" aria-label="Faculty manuscripts repository list">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>{locale === 'vi' ? 'Bản thảo' : 'Manuscript'}</th>
                <th>{locale === 'vi' ? 'Chuyên ngành' : 'Discipline'}</th>
                <th>{locale === 'vi' ? 'Phiên bản' : 'Version'}</th>
                <th>{locale === 'vi' ? 'Trạng thái' : 'Status'}</th>
                <th>{locale === 'vi' ? 'Cập nhật' : 'Updated'}</th>
                <th style={{ textAlign: 'right' }}>{locale === 'vi' ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item: StudentPreprint) => (
                <tr key={item.id}>
                  <td className="dashboard-table__title-cell">
                    <div className="dashboard-table__title-group">
                      <Link
                        href={item.status === 'DRAFT' ? ROUTES.LECTURER.SUBMISSION_EDIT(item.id) : ROUTES.LECTURER.SUBMISSION_DETAIL(item.id)}
                        className="dashboard-table__title-link"
                      >
                        {item.title}
                      </Link>
                      {item.is_private && (
                        <span className="dashboard-private-pill">{locale === 'vi' ? 'Riêng tư' : 'Private'}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="dashboard-badge-tag">{item.discipline || (locale === 'vi' ? 'Đa ngành' : 'General')}</span>
                  </td>
                  <td>
                    <span className="dashboard-version-pill">v{item.current_version}</span>
                  </td>
                  <td>
                    {renderStatusBadge(item.status)}
                  </td>
                  <td className="dashboard-table__date">
                    {formatUpdatedDate(item.updated_at, locale)}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {(item.status === 'PUBLISHED' || item.status === 'APPROVED') && (
                      <Link
                        href={ROUTES.LECTURER.SUBMISSION_EDIT(item.id)}
                        className="student-btn student-btn--secondary student-btn--sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          fontSize: '12.5px',
                          borderColor: '#0071bc',
                          color: '#0071bc',
                          fontWeight: 600,
                        }}
                        title={locale === 'vi' ? 'Cập nhật nội dung hoặc nộp file bản thảo mới' : 'Update paper or upload new file'}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        <span>{locale === 'vi' ? 'Cập nhật' : 'Update'}</span>
                      </Link>
                    )}
                    {item.status === 'NEEDS_REVISION' && (
                      <Link
                        href={ROUTES.LECTURER.SUBMISSION_EDIT(item.id)}
                        className="student-btn student-btn--warning student-btn--sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          fontSize: '12.5px',
                        }}
                      >
                        <span>{locale === 'vi' ? 'Chỉnh sửa' : 'Revise'}</span>
                      </Link>
                    )}
                    {item.status === 'DRAFT' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                        <Link
                          href={ROUTES.LECTURER.SUBMISSION_EDIT(item.id)}
                          className="student-btn student-btn--primary student-btn--sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            fontSize: '12.5px',
                          }}
                        >
                          <span>{t('student.preprints.continueEdit') || (locale === 'vi' ? 'Tiếp tục' : 'Continue')}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmItem(item)}
                          disabled={deletingId === item.id}
                          className="student-btn student-btn--danger student-btn--sm"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            fontSize: '12.5px',
                            backgroundColor: '#fff',
                            color: '#dc2626',
                            borderColor: '#fca5a5',
                          }}
                          title={t('student.preprints.deleteDraft') || (locale === 'vi' ? 'Xóa bản nháp' : 'Delete Draft')}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                          <span>{t('common.delete') || (locale === 'vi' ? 'Xóa' : 'Delete')}</span>
                        </button>
                      </div>
                    )}
                    {(item.status === 'UNDER_REVIEW' || item.status === 'REJECTED' || item.status === 'WITHDRAWN') && (
                      <Link
                        href={ROUTES.LECTURER.SUBMISSION_DETAIL(item.id)}
                        className="student-btn student-btn--ghost student-btn--sm"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          fontSize: '12.5px',
                        }}
                      >
                        <span>{locale === 'vi' ? 'Chi tiết' : 'Details'}</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirmItem && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={() => {
            if (!deletingId) setDeleteConfirmItem(null);
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#0f172a' }}>
                  {t('student.preprints.deleteDraft') || (locale === 'vi' ? 'Xác nhận xóa bản nháp' : 'Confirm Delete Draft')}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                  {t('student.preprints.confirmDeleteDraft') || (locale === 'vi' ? 'Hành động này không thể hoàn tác.' : 'This action cannot be undone.')}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', lineHeight: 1.5, marginBottom: '20px' }}>
              {locale === 'vi' ? (
                <>Bạn có chắc chắn muốn xóa bản nháp <strong>&ldquo;{deleteConfirmItem.title}&rdquo;</strong> không?</>
              ) : (
                <>Are you sure you want to permanently delete draft <strong>&ldquo;{deleteConfirmItem.title}&rdquo;</strong>?</>
              )}
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="student-btn student-btn--ghost"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={Boolean(deletingId)}
                style={{ padding: '8px 16px', fontSize: '13.5px' }}
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                className="student-btn student-btn--danger"
                onClick={() => handleDeleteDraft(deleteConfirmItem)}
                disabled={Boolean(deletingId)}
                style={{
                  padding: '8px 18px',
                  fontSize: '13.5px',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: deletingId ? 'not-allowed' : 'pointer',
                  opacity: deletingId ? 0.7 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {deletingId ? (
                  <>
                    <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <span>{locale === 'vi' ? 'Đang xóa...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <span>{t('student.preprints.deleteDraft') || (locale === 'vi' ? 'Xóa bản nháp' : 'Delete Draft')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </LecturerShell>
  );
}

export default LecturerSubmissionsView;
