'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'next/navigation';
import { LecturerShell } from '../components';
import {
  lecturerPublicationApi,
  type LecturerPublication,
  type LecturerPublicationScope,
} from '../api/lecturerReviewApi';
import { ROUTES } from '@/app/router';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Skeleton, PublishedPaperCardSkeleton } from '@/components/skeleton';
import { useTranslation } from '@/i18n';

const NativePdfViewer = dynamic(
  () => import('../../preprint/components/NativePdfViewer').then((mod) => mod.NativePdfViewer),
  {
    ssr: false,
    loading: () => (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
        <div className="student-spinner" />
        <span style={{ fontSize: '14px', color: '#64748b' }}>Đang tải tài liệu PDF...</span>
      </div>
    ),
  }
);

function formatDisplayDate(value?: string | null, locale: string = 'vi') {
  if (!value) return locale === 'vi' ? 'Chưa công bố' : 'Unpublished';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function generateCitations(pub: LecturerPublication) {
  const authorNames = pub.authors && pub.authors.length > 0
    ? pub.authors.map((a) => a.name).join(', ')
    : pub.uploader?.name || 'Tác giả ẩn danh';
  
  const year = pub.createdAt ? new Date(pub.createdAt).getFullYear() : new Date().getFullYear();
  const title = pub.title || 'Untitled Research';
  const doiStr = pub.doi ? ` https://doi.org/${pub.doi}` : '';

  // APA 7th
  const apa = `${authorNames} (${year}). ${title}. ResearchPulse Academic Repository.${doiStr}`;

  // IEEE
  const firstAuthor = pub.authors?.[0]?.name || pub.uploader?.name || 'Author';
  const ieeeEtAl = (pub.authors?.length || 0) > 1 ? ' et al.,' : ',';
  const ieee = `${firstAuthor}${ieeeEtAl} "${title}," ResearchPulse Repository, ${year}.${doiStr ? ` doi:${pub.doi}` : ''}`;

  // BibTeX
  const bibKey = (pub.authors?.[0]?.name?.split(' ').pop() || 'author').toLowerCase() + year;
  const bibtex = `@article{${bibKey},\n  author = {${authorNames}},\n  title = {${title}},\n  journal = {ResearchPulse Scientific Journal},\n  year = {${year}}${pub.doi ? `,\n  doi = {${pub.doi}}` : ''}\n}`;

  return { apa, ieee, bibtex };
}

export function LecturerPublicationsView() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<LecturerPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedScope, setSelectedScope] = useState<LecturerPublicationScope>('ALL');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || searchParams?.get('q') || '');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'TITLE' | 'CITATIONS'>('NEWEST');

  // Modal State for Detail & Native PDF Viewer
  const [selectedPub, setSelectedPub] = useState<LecturerPublication | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'pdf'>('overview');
  const [citationFormat, setCitationFormat] = useState<'APA' | 'IEEE' | 'BibTeX'>('APA');
  const [citationCopied, setCitationCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedPub) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
      };
    }
  }, [selectedPub]);

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
    const newUrl = val.trim() ? `/lecturer/publications?search=${encodeURIComponent(val.trim())}` : '/lecturer/publications';
    window.history.replaceState(null, '', newUrl);
  };

  const isMyPublication = useCallback(
    (pub: LecturerPublication) => {
      if (!user) return false;
      if (pub.uploader?.id && pub.uploader.id === user.id) return true;
      if (user.email && pub.uploader?.email && pub.uploader.email.toLowerCase() === user.email.toLowerCase()) return true;
      return false;
    },
    [user],
  );

  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await lecturerPublicationApi.list({
        discipline: selectedDiscipline !== 'ALL' ? selectedDiscipline : undefined,
      });
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load publications repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  }, [selectedDiscipline]);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  // Extract unique disciplines for the filter dropdown
  const disciplines = useMemo(() => {
    const list = new Set<string>();
    items.forEach((item) => {
      if (item.discipline && item.discipline.trim()) {
        list.add(item.discipline.trim());
      }
    });
    return Array.from(list).sort();
  }, [items]);

  // Helper to determine the access scope of a publication
  const getPublicationScope = useCallback(
    (pub: LecturerPublication): 'PUBLIC' | 'FACULTY_ONLY' | 'CAMPUS' | 'ASSIGNED' => {
      const isMine = isMyPublication(pub);
      if ((pub.myReview || pub.status === 'REVIEWING') && !isMine) {
        return 'ASSIGNED';
      }
      if (!pub.audiences || pub.audiences.length === 0) return 'CAMPUS';
      if (pub.audiences.includes('GUEST')) return 'PUBLIC';
      if (pub.audiences.includes('LECTURER') && !pub.audiences.includes('STUDENT')) return 'FACULTY_ONLY';
      return 'CAMPUS';
    },
    [isMyPublication],
  );

  // Metrics summary
  const metrics = useMemo(() => {
    let publicCount = 0;
    let facultyCount = 0;
    let campusCount = 0;
    let assignedCount = 0;

    items.forEach((pub) => {
      const scope = getPublicationScope(pub);
      if (scope === 'PUBLIC') publicCount++;
      else if (scope === 'FACULTY_ONLY') facultyCount++;
      else if (scope === 'CAMPUS') campusCount++;
      else if (scope === 'ASSIGNED') assignedCount++;
    });

    return {
      total: items.length,
      publicCount,
      facultyCount,
      campusCount,
      assignedCount,
    };
  }, [items, getPublicationScope]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((pub) => {
        // Scope Filter
        if (selectedScope !== 'ALL') {
          const scope = getPublicationScope(pub);
          if (selectedScope === 'PUBLIC' && scope !== 'PUBLIC') return false;
          if (selectedScope === 'FACULTY_ONLY' && scope !== 'FACULTY_ONLY') return false;
          if (selectedScope === 'CAMPUS' && scope !== 'CAMPUS') return false;
          if (selectedScope === 'ASSIGNED' && scope !== 'ASSIGNED') return false;
        }

        // Discipline Filter
        if (selectedDiscipline !== 'ALL' && pub.discipline !== selectedDiscipline) {
          return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = (pub.title || '').toLowerCase().includes(q);
          const matchAbstract = (pub.abstract || '').toLowerCase().includes(q);
          const matchDoi = (pub.doi || '').toLowerCase().includes(q);
          const matchAuthors = pub.authors?.some((a) => a.name.toLowerCase().includes(q));
          const matchKeywords = pub.keywords?.some((k) => k.toLowerCase().includes(q));
          if (!matchTitle && !matchAbstract && !matchDoi && !matchAuthors && !matchKeywords) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'TITLE') {
          return (a.title || '').localeCompare(b.title || '');
        }
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
  }, [items, selectedScope, selectedDiscipline, searchQuery, sortBy, getPublicationScope]);

  // Open Paper Detail Modal & Lazy Load PDF Presigned Download URL
  const handleSelectPaper = async (pub: LecturerPublication) => {
    setSelectedPub(pub);
    setModalTab('overview');

    if (!pub.downloadUrl) {
      try {
        const detail = await lecturerPublicationApi.get(pub.id);
        if (detail?.downloadUrl) {
          setSelectedPub((prev) => (prev && prev.id === pub.id ? { ...prev, downloadUrl: detail.downloadUrl } : prev));
          setItems((prev) =>
            prev.map((item) => (item.id === pub.id ? { ...item, downloadUrl: detail.downloadUrl } : item))
          );
        }
      } catch (err) {
        console.error('Failed to load publication PDF detail:', err);
      }
    }
  };

  const copyCitation = (pub: LecturerPublication) => {
    const citations = generateCitations(pub);
    const text = citations[citationFormat.toLowerCase() as keyof typeof citations] || citations.apa;
    navigator.clipboard.writeText(text);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2200);
  };

  const renderScopeBadge = (pub: LecturerPublication) => {
    const scope = getPublicationScope(pub);
    switch (scope) {
      case 'PUBLIC':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
            }}
            title={locale === 'vi' ? 'Công khai: Mọi người trong và ngoài trường đều xem được' : 'Public: Accessible to anyone'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            {locale === 'vi' ? 'CÔNG KHAI (PUBLIC)' : 'PUBLIC'}
          </span>
        );
      case 'FACULTY_ONLY':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              border: '1px solid #ddd6fe',
            }}
            title={locale === 'vi' ? 'Chỉ Giảng viên: Lưu hành nội bộ cán bộ nghiên cứu' : 'Faculty Only: Internal academic access'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
            {locale === 'vi' ? 'CHỈ GIẢNG VIÊN' : 'FACULTY ONLY'}
          </span>
        );
      case 'CAMPUS':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
            }}
            title={locale === 'vi' ? 'Nội bộ trường: Giảng viên và sinh viên đã xác thực' : 'Campus-wide: All authenticated members'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {locale === 'vi' ? 'NỘI BỘ TRƯỜNG' : 'CAMPUS-WIDE'}
          </span>
        );
      case 'ASSIGNED':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11.5px',
              fontWeight: 700,
              backgroundColor: '#fffbeb',
              color: '#d97706',
              border: '1px solid #fde68a',
            }}
            title={locale === 'vi' ? 'Được giao: Bài báo đang trong vòng thẩm định của bạn' : 'Assigned: Peer review task assigned to you'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {locale === 'vi' ? 'ĐƯỢC GIAO THẨM ĐỊNH' : 'ASSIGNED TO ME'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <LecturerShell active="publications" title={t('lecturer.topbar.publicationsTitle') || 'Kho bài báo khoa học'}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0071bc',
                padding: '6px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="9" y1="6" x2="16" y2="6" />
                <line x1="9" y1="10" x2="16" y2="10" />
              </svg>
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: '#102a43', letterSpacing: '-0.02em' }}>
              {t('lecturer.publicationsRepository') || 'Kho bài báo khoa học'}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#627d98', maxWidth: '640px', lineHeight: 1.5 }}>
            {t('lecturer.publicationsSubtitle') || 'Khám phá, tra cứu, trích dẫn và tham khảo các công trình nghiên cứu khoa học được bảo hộ và công bố.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={fetchPublications}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {locale === 'vi' ? 'Làm mới' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Metrics Summary Strip (Student Metric Style) */}
      <div className="student-metrics-grid student-metrics-grid--3" style={{ marginBottom: '24px' }}>
        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{loading ? <Skeleton width={36} height={26} style={{ display: 'inline-block' }} /> : metrics.total}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Tổng số bài báo lưu trữ' : 'Total Repository Papers'}</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{loading ? <Skeleton width={36} height={26} style={{ display: 'inline-block' }} /> : Math.max(1, disciplines.length)}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Lĩnh vực nghiên cứu' : 'Academic Disciplines'}</span>
          </div>
        </div>

        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{loading ? <Skeleton width={36} height={26} style={{ display: 'inline-block' }} /> : filteredItems.length}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Kết quả hiển thị' : 'Matching Results'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Scope Tabs Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginRight: '4px' }}>
            {locale === 'vi' ? 'Phạm vi hiển thị:' : 'Visibility Scope:'}
          </span>

          <button
            type="button"
            className={`student-tab-pill ${selectedScope === 'ALL' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedScope('ALL')}
          >
            {t('lecturer.scopeAll') || 'Tất cả'} <span className="student-tab-pill__count">{metrics.total}</span>
          </button>

          <button
            type="button"
            className={`student-tab-pill ${selectedScope === 'PUBLIC' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedScope('PUBLIC')}
          >
            🌐 {t('lecturer.scopePublic') || 'Công khai'} <span className="student-tab-pill__count">{metrics.publicCount}</span>
          </button>

          <button
            type="button"
            className={`student-tab-pill ${selectedScope === 'FACULTY_ONLY' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedScope('FACULTY_ONLY')}
          >
            🎓 {t('lecturer.scopeFaculty') || 'Chỉ Giảng viên'} <span className="student-tab-pill__count">{metrics.facultyCount}</span>
          </button>

          <button
            type="button"
            className={`student-tab-pill ${selectedScope === 'CAMPUS' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedScope('CAMPUS')}
          >
            🏫 {t('lecturer.scopeCampus') || 'Nội bộ trường'} <span className="student-tab-pill__count">{metrics.campusCount}</span>
          </button>

          <button
            type="button"
            className={`student-tab-pill ${selectedScope === 'ASSIGNED' ? 'student-tab-pill--active' : ''}`}
            onClick={() => setSelectedScope('ASSIGNED')}
          >
            🔒 {t('lecturer.scopeAssigned') || 'Được giao thẩm định'} <span className="student-tab-pill__count">{metrics.assignedCount}</span>
          </button>
        </div>

        {/* Search & Secondary Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 300px' }}>
            <span
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'none',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleToolbarSearchChange(e.target.value)}
              placeholder={t('lecturer.searchPlaceholder') || 'Tìm theo tiêu đề, tác giả, DOI, từ khóa...'}
              style={{
                width: '100%',
                padding: '9px 36px 9px 40px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleToolbarSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px',
                  lineHeight: 1,
                  padding: '4px',
                }}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Discipline Dropdown */}
          <div style={{ minWidth: '180px' }}>
            <select
              value={selectedDiscipline}
              onChange={(e) => setSelectedDiscipline(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="ALL">
                {t('lecturer.filterAllDisciplines') || 'Tất cả chuyên ngành'}
              </option>
              {disciplines.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ minWidth: '150px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                backgroundColor: '#ffffff',
                color: '#334155',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="NEWEST">{locale === 'vi' ? 'Mới nhất' : 'Newest'}</option>
              <option value="TITLE">{locale === 'vi' ? 'Tiêu đề A-Z' : 'Title A-Z'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Publications Grid (Matching Student Style) */}
      {loading ? (
        <div className="student-pub-grid">
          <PublishedPaperCardSkeleton count={6} />
        </div>
      ) : error ? (
        <div
          style={{
            padding: '24px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#b91c1c',
            textAlign: 'center',
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>{error}</p>
          <button
            type="button"
            onClick={fetchPublications}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {locale === 'vi' ? 'Thử lại' : 'Retry'}
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              marginBottom: '14px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
            {t('lecturer.noPublications') || 'Không tìm thấy bài báo nào phù hợp với bộ lọc.'}
          </h3>
          <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
            {locale === 'vi'
              ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn phạm vi hiển thị khác.'
              : 'Try changing your search terms or selecting another visibility scope.'}
          </p>
        </div>
      ) : (
        <div className="student-pub-grid">
          {filteredItems.map((pub) => {
            const authorNames = pub.authors && pub.authors.length > 0
              ? pub.authors.map((a) => a.name).join(', ')
              : pub.uploader?.name || (locale === 'vi' ? 'Tác giả ẩn danh' : 'Unknown Author');

            return (
              <div
                key={pub.id}
                onClick={() => handleSelectPaper(pub)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectPaper(pub);
                  }
                }}
                className="student-pub-card"
              >
                <div>
                  {/* Card Header: Scope Badge + Discipline + Version */}
                  <div className="student-pub-card__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {renderScopeBadge(pub)}
                      <span className="student-pub-card__discipline">
                        {pub.discipline || (locale === 'vi' ? 'Khoa học tổng quát' : 'General Science')}
                      </span>
                    </div>

                    <span className="student-pub-card__version">
                      {pub.currentVersion?.versionLabel || 'v1.0'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="student-pub-card__title">
                    {pub.title || (locale === 'vi' ? 'Bản thảo chưa đặt tên' : 'Untitled Manuscript')}
                  </h3>

                  {/* Author Row */}
                  <div className="student-pub-card__author">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="student-pub-card__author-name">
                      {authorNames}
                    </span>
                  </div>

                  {/* Abstract preview */}
                  {pub.abstract && (
                    <p className="student-pub-card__abstract">
                      {pub.abstract}
                    </p>
                  )}
                </div>

                <div>
                  {/* Tags */}
                  {pub.keywords && pub.keywords.length > 0 && (
                    <div className="student-pub-card__tags">
                      {pub.keywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="student-pub-card__tag" title={`#${kw}`}>
                          #{kw}
                        </span>
                      ))}
                      {pub.keywords.length > 3 && (
                        <span className="student-pub-card__tag-more">+{pub.keywords.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Card Footer: Date & Action */}
                  <div className="student-pub-card__footer">
                    <span className="student-pub-card__date">
                      {formatDisplayDate(pub.createdAt, locale)}
                    </span>
                    <span className="student-pub-card__action">
                      {locale === 'vi' ? 'Xem & Trích dẫn' : 'View & Cite'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Detail & Native PDF Viewer (Student Style) */}
      {mounted && selectedPub && createPortal(
        <div
          className="pl-published-modal-backdrop"
          data-lenis-prevent="true"
          onWheel={(e) => e.stopPropagation()}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPub(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overscrollBehavior: 'contain',
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            data-lenis-prevent="true"
            onWheel={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: modalTab === 'pdf' ? '980px' : '680px',
              transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedPub(null)}
              className="student-modal-close-btn"
              title={locale === 'vi' ? 'Đóng' : 'Close'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Modal Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {renderScopeBadge(selectedPub)}
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0071bc', background: '#f0f7fc', padding: '4px 10px', borderRadius: '6px' }}>
                  {selectedPub.discipline || (locale === 'vi' ? 'Khoa học tổng quát' : 'General Science')}
                </span>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                {selectedPub.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#64748b', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>
                    {selectedPub.authors && selectedPub.authors.length > 0
                      ? selectedPub.authors.map((a) => a.name).join(' · ')
                      : selectedPub.uploader?.name || (locale === 'vi' ? 'Tác giả ẩn danh' : 'Unknown Author')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>{selectedPub.currentVersion?.versionLabel || 'v1.0'}</span>
                </div>
                {selectedPub.doi && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#0284c7' }}>DOI: {selectedPub.doi}</span>
                  </div>
                )}
              </div>
            </div>

            {modalTab === 'pdf' ? (
              <div style={{ marginTop: 16 }}>
                {selectedPub.downloadUrl ? (
                  <NativePdfViewer
                    url={selectedPub.downloadUrl}
                    fileName={selectedPub.currentVersion?.fileName || `${selectedPub.title?.substring(0, 50) || 'manuscript'}.pdf`}
                  />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 350, gap: 12 }}>
                    <div className="student-spinner" />
                    <span style={{ fontSize: 14, color: '#64748b' }}>{locale === 'vi' ? 'Đang chuẩn bị tài liệu PDF...' : 'Loading PDF document...'}</span>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Abstract Section */}
                {selectedPub.abstract && (
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '12.5px', textTransform: 'uppercase', color: '#0071bc', margin: '0 0 8px 0', fontWeight: 800, letterSpacing: '0.05em' }}>
                      {locale === 'vi' ? 'Tóm tắt công trình' : 'Abstract'}
                    </h4>
                    <p style={{ fontSize: '14.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                      {selectedPub.abstract}
                    </p>
                  </div>
                )}

                {/* Keywords Chips */}
                {selectedPub.keywords && selectedPub.keywords.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                      {locale === 'vi' ? 'Từ khóa nghiên cứu:' : 'Keywords:'}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedPub.keywords.map((kw) => (
                        <span
                          key={kw}
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#475569',
                            background: '#f1f5f9',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Citation Box */}
                {(() => {
                  const citations = generateCitations(selectedPub);
                  const citationText = citations[citationFormat.toLowerCase() as keyof typeof citations] || citations.apa;
                  return (
                    <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                          <span>{locale === 'vi' ? 'Trích dẫn bài báo này:' : 'Cite this paper:'}</span>
                          <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '6px' }}>
                            {(['APA', 'IEEE', 'BibTeX'] as const).map((fmt) => (
                              <button
                                key={fmt}
                                type="button"
                                onClick={() => setCitationFormat(fmt)}
                                className={`student-citation-fmt-btn ${citationFormat === fmt ? 'student-citation-fmt-btn--active' : ''}`}
                              >
                                {fmt}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyCitation(selectedPub)}
                          className="student-citation-copy-btn"
                          style={{ color: citationCopied ? '#15803d' : '#0071bc' }}
                        >
                          {citationCopied ? (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                              <span>{locale === 'vi' ? 'Đã sao chép!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                              <span>{locale === 'vi' ? 'Sao chép trích dẫn' : 'Copy Citation'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{ fontSize: '13px', color: '#14532d', background: '#ffffff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #dcfce7', fontFamily: 'monospace', lineHeight: 1.5, overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
                        {citationText}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Modal Footer */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: '20px' }}>
              {modalTab === 'pdf' ? (
                <>
                  <button type="button" onClick={() => setModalTab('overview')} className="student-modal-btn-dismiss" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                    {locale === 'vi' ? 'Quay lại tóm tắt' : 'Back to summary'}
                  </button>
                  <button type="button" onClick={() => setSelectedPub(null)} className="student-modal-btn-dismiss">
                    {locale === 'vi' ? 'Đóng' : 'Close'}
                  </button>
                </>
              ) : (
                <>
                  {isMyPublication(selectedPub) && (
                    <Link
                      href={ROUTES.LECTURER.SUBMISSION_EDIT(selectedPub.id)}
                      className="student-modal-btn-dismiss"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #86efac' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      {locale === 'vi' ? 'Cập nhật bài báo' : 'Update Paper'}
                    </Link>
                  )}
                  <button type="button" onClick={() => setSelectedPub(null)} className="student-modal-btn-dismiss">
                    {locale === 'vi' ? 'Đóng' : 'Close'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('pdf')}
                    className="student-modal-btn-detail"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: 'none', cursor: 'pointer' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    {locale === 'vi' ? 'Xem chi tiết bài báo (PDF)' : 'View Full Paper (PDF)'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </LecturerShell>
  );
}

export default LecturerPublicationsView;
