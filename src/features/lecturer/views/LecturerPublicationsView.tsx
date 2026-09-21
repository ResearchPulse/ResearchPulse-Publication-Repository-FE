'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LecturerShell } from '../components';
import {
  lecturerPublicationApi,
  type LecturerPublication,
  type LecturerPublicationScope,
} from '../api/lecturerReviewApi';
import { ROUTES } from '@/app/router';
import { Skeleton } from '@/components/skeleton';
import { useTranslation } from '@/i18n';

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
  const searchParams = useSearchParams();
  const [items, setItems] = useState<LecturerPublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedScope, setSelectedScope] = useState<LecturerPublicationScope>('ALL');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || searchParams?.get('q') || '');
  const [sortBy, setSortBy] = useState<'NEWEST' | 'TITLE' | 'CITATIONS'>('NEWEST');

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

  // Citation Modal State
  const [citeModalPub, setCiteModalPub] = useState<LecturerPublication | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Full-Text Viewer Modal State
  const [viewPdfPub, setViewPdfPub] = useState<LecturerPublication | null>(null);

  // Expandable abstracts
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});

  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await lecturerPublicationApi.list({
        scope: selectedScope,
        discipline: selectedDiscipline !== 'ALL' ? selectedDiscipline : undefined,
      });
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load publications repository:', err);
      setError(err instanceof Error ? err.message : 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  }, [selectedScope, selectedDiscipline]);

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
  const getPublicationScope = (pub: LecturerPublication): 'PUBLIC' | 'FACULTY_ONLY' | 'CAMPUS' | 'ASSIGNED' => {
    if (pub.status === 'REVIEWING') return 'ASSIGNED';
    if (!pub.audiences || pub.audiences.length === 0) return 'CAMPUS';
    if (pub.audiences.includes('GUEST')) return 'PUBLIC';
    if (pub.audiences.includes('LECTURER') && !pub.audiences.includes('STUDENT')) return 'FACULTY_ONLY';
    return 'CAMPUS';
  };

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
  }, [items]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items
      .filter((pub) => {
        // Scope Filter (when client-side filtering beyond query)
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
  }, [items, selectedScope, selectedDiscipline, searchQuery, sortBy]);

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
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
            title={locale === 'vi' ? 'Được phân công thẩm định: Nhóm tác giả & Giảng viên review' : 'Under Review: Reviewer & author group only'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {locale === 'vi' ? 'ĐANG THẨM ĐỊNH' : 'UNDER REVIEW'}
          </span>
        );
    }
  };

  return (
    <LecturerShell
      active="publications"
      title={t('lecturer.publicationsRepository') || 'Kho bài báo khoa học'}
    >
      {/* Top Banner / Hero Header (Matching Web Portal Theme) */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f7fc 100%)',
          border: '1px solid #dce4e9',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '22px',
          boxShadow: '0 2px 8px rgba(18, 35, 49, 0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span
              style={{
                backgroundColor: '#e6f2f9',
                color: '#0071bc',
                padding: '6px',
                borderRadius: '8px',
                display: 'inline-flex',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                <line x1="9" y1="6" x2="16" y2="6" />
                <line x1="9" y1="10" x2="16" y2="10" />
              </svg>
            </span>
            <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#102a43', letterSpacing: '-0.02em' }}>
              {t('lecturer.publicationsRepository') || 'Kho bài báo khoa học'}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#627d98', maxWidth: '640px' }}>
            {t('lecturer.publicationsSubtitle') || 'Tra cứu, trích dẫn và tham khảo các công trình nghiên cứu khoa học được bảo hộ và công bố.'}
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

      {/* Metrics Summary Strip (All 5 cards on 1 row) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
          gap: '14px',
          marginBottom: '22px',
        }}
      >
        <div
          className={`student-metric-card ${selectedScope === 'ALL' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedScope('ALL')}
          style={{ cursor: 'pointer', padding: '16px 14px', minWidth: 0 }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon student-metric-icon--blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="student-metric-info" style={{ minWidth: 0 }}>
            <span className="student-metric-value">{metrics.total}</span>
            <span className="student-metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('lecturer.scopeAll') || 'Tất cả'}
            </span>
          </div>
        </div>

        <div
          className={`student-metric-card ${selectedScope === 'PUBLIC' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedScope('PUBLIC')}
          style={{ cursor: 'pointer', padding: '16px 14px', minWidth: 0 }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon student-metric-icon--green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div className="student-metric-info" style={{ minWidth: 0 }}>
            <span className="student-metric-value" style={{ color: '#059669' }}>{metrics.publicCount}</span>
            <span className="student-metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('lecturer.scopePublic') || 'Công khai'}
            </span>
          </div>
        </div>

        <div
          className={`student-metric-card ${selectedScope === 'FACULTY_ONLY' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedScope('FACULTY_ONLY')}
          style={{ cursor: 'pointer', padding: '16px 14px', minWidth: 0 }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div className="student-metric-info" style={{ minWidth: 0 }}>
            <span className="student-metric-value" style={{ color: '#7c3aed' }}>{metrics.facultyCount}</span>
            <span className="student-metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('lecturer.scopeFaculty') || 'Chỉ Giảng viên'}
            </span>
          </div>
        </div>

        <div
          className={`student-metric-card ${selectedScope === 'CAMPUS' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedScope('CAMPUS')}
          style={{ cursor: 'pointer', padding: '16px 14px', minWidth: 0 }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="student-metric-info" style={{ minWidth: 0 }}>
            <span className="student-metric-value" style={{ color: '#2563eb' }}>{metrics.campusCount}</span>
            <span className="student-metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('lecturer.scopeCampus') || 'Nội bộ trường'}
            </span>
          </div>
        </div>

        <div
          className={`student-metric-card ${selectedScope === 'ASSIGNED' ? 'student-metric-card--active' : ''}`}
          onClick={() => setSelectedScope('ASSIGNED')}
          style={{ cursor: 'pointer', padding: '16px 14px', minWidth: 0 }}
          role="button"
          tabIndex={0}
        >
          <div className="student-metric-icon student-metric-icon--amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="student-metric-info" style={{ minWidth: 0 }}>
            <span className="student-metric-value" style={{ color: '#d97706' }}>{metrics.assignedCount}</span>
            <span className="student-metric-label" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t('lecturer.scopeAssigned') || 'Được giao thẩm định'}
            </span>
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
              <option value="TITLE">{locale === 'vi' ? 'Tựa đề A-Z' : 'Title A-Z'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Publications Content List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Skeleton variant="pill" width={110} height={24} />
                <Skeleton variant="pill" width={90} height={24} />
              </div>
              <Skeleton height={22} width="70%" />
              <Skeleton height={14} width="40%" />
              <Skeleton height={14} width="95%" />
              <Skeleton height={14} width="80%" />
            </div>
          ))}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {filteredItems.map((pub) => {
            const isExpanded = expandedAbstracts[pub.id] || false;
            const hasAbstract = !!pub.abstract && pub.abstract.trim().length > 0;
            const abstractText = pub.abstract || '';
            const shouldTruncate = abstractText.length > 260;
            const displayAbstract = shouldTruncate && !isExpanded
              ? abstractText.slice(0, 260) + '...'
              : abstractText;

            return (
              <div
                key={pub.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px 24px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Card Header: Scope Badge + Discipline + Meta Date */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {renderScopeBadge(pub)}
                    {pub.discipline && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#475569',
                          backgroundColor: '#f1f5f9',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontWeight: 500,
                        }}
                      >
                        {pub.discipline}
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    {formatDisplayDate(pub.createdAt, locale)}
                  </span>
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '2px 0 0 0',
                    lineHeight: 1.4,
                  }}
                >
                  {pub.title || (locale === 'vi' ? 'Bản thảo chưa đặt tên' : 'Untitled Manuscript')}
                </h2>

                {/* Authors Strip */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', fontSize: '13px', color: '#334155' }}>
                  <span style={{ fontWeight: 600, color: '#64748b' }}>
                    {locale === 'vi' ? 'Tác giả:' : 'Authors:'}
                  </span>
                  {pub.authors && pub.authors.length > 0 ? (
                    pub.authors.map((author, index) => (
                      <span key={author.id || index} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 500 }}>{author.name}</span>
                        {index < (pub.authors?.length || 1) - 1 && <span style={{ color: '#94a3b8', marginRight: '4px' }}>,</span>}
                      </span>
                    ))
                  ) : (
                    <span>{pub.uploader?.name || pub.uploader?.email || 'N/A'}</span>
                  )}

                  {pub.doi && (
                    <span
                      style={{
                        marginLeft: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        color: '#0284c7',
                        fontWeight: 600,
                        backgroundColor: '#f0f9ff',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      DOI: {pub.doi}
                    </span>
                  )}
                </div>

                {/* Abstract */}
                {hasAbstract && (
                  <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.55, marginTop: '2px' }}>
                    <p style={{ margin: 0 }}>
                      {displayAbstract}
                      {shouldTruncate && (
                        <button
                          type="button"
                          onClick={() => toggleAbstract(pub.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0071bc',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0 4px',
                            fontSize: '13px',
                          }}
                        >
                          {isExpanded
                            ? (locale === 'vi' ? 'Thu gọn' : 'Show less')
                            : (locale === 'vi' ? 'Xem thêm' : 'Show more')}
                        </button>
                      )}
                    </p>
                  </div>
                )}

                {/* Keywords */}
                {pub.keywords && pub.keywords.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {pub.keywords.map((kw, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: '11.5px',
                          color: '#64748b',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Actions Toolbar */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    marginTop: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* View Details / Read Link */}
                    {pub.status === 'REVIEWING' ? (
                      <Link
                        href={ROUTES.LECTURER.REVIEW_DETAIL(pub.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#0071bc',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        {locale === 'vi' ? 'Vào thẩm định' : 'Review Manuscript'}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setViewPdfPub(pub)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#0071bc',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                        </svg>
                        {t('lecturer.readFullText') || 'Đọc toàn văn'}
                      </button>
                    )}

                    {/* Cite Button */}
                    <button
                      type="button"
                      onClick={() => setCiteModalPub(pub)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4v5zm-5 0v3a2 2 0 0 0 2 2h3M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4v5zm-5 0v3a2 2 0 0 0 2 2h3" />
                      </svg>
                      {t('lecturer.citePaper') || 'Trích dẫn'}
                    </button>
                  </div>

                  {/* Direct PDF Download if available */}
                  {(pub.downloadUrl || pub.currentVersion?.fileName) && (
                    <a
                      href={pub.downloadUrl || `/api/pdf-proxy?key=${encodeURIComponent(pub.objectKey)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: '#64748b',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        textDecoration: 'none',
                        padding: '6px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      {pub.currentVersion?.fileName || 'Download PDF'}
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Citation Modal */}
      {citeModalPub && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={() => setCiteModalPub(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4v5zm-5 0v3a2 2 0 0 0 2 2h3M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4v5zm-5 0v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  {t('lecturer.citePaper') || 'Trích dẫn công trình'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCiteModalPub(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
              &ldquo;{citeModalPub.title}&rdquo;
            </p>

            {/* Citation Formats */}
            {(() => {
              const { apa, ieee, bibtex } = generateCitations(citeModalPub);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* APA */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0284c7' }}>APA 7th Edition</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(apa, 'APA')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: copiedFormat === 'APA' ? '#ecfdf5' : '#ffffff',
                          color: copiedFormat === 'APA' ? '#059669' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedFormat === 'APA' ? `✓ ${t('lecturer.copied') || 'Đã sao chép!'}` : t('lecturer.copyCitation') || 'Sao chép'}
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>{apa}</p>
                  </div>

                  {/* IEEE */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0284c7' }}>IEEE</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(ieee, 'IEEE')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: copiedFormat === 'IEEE' ? '#ecfdf5' : '#ffffff',
                          color: copiedFormat === 'IEEE' ? '#059669' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedFormat === 'IEEE' ? `✓ ${t('lecturer.copied') || 'Đã sao chép!'}` : t('lecturer.copyCitation') || 'Sao chép'}
                      </button>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.45 }}>{ieee}</p>
                  </div>

                  {/* BibTeX */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '13px', color: '#0284c7' }}>BibTeX</strong>
                      <button
                        type="button"
                        onClick={() => handleCopyCitation(bibtex, 'BIBTEX')}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: copiedFormat === 'BIBTEX' ? '#ecfdf5' : '#ffffff',
                          color: copiedFormat === 'BIBTEX' ? '#059669' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedFormat === 'BIBTEX' ? `✓ ${t('lecturer.copied') || 'Đã sao chép!'}` : t('lecturer.copyCitation') || 'Sao chép'}
                      </button>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: '8px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#1e293b',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {bibtex}
                    </pre>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Full-Text PDF Reader Modal */}
      {viewPdfPub && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 110,
          }}
        >
          {/* Viewer Header */}
          <div
            style={{
              padding: '14px 24px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {locale === 'vi' ? 'Đọc toàn văn công trình' : 'Full-Text Document Viewer'}
              </span>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>{viewPdfPub.title}</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a
                href={viewPdfPub.downloadUrl || `/api/pdf-proxy?key=${encodeURIComponent(viewPdfPub.objectKey)}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#0071bc',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                {locale === 'vi' ? 'Tải tệp PDF' : 'Download PDF'}
              </a>

              <button
                type="button"
                onClick={() => setViewPdfPub(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Viewer Frame */}
          <div style={{ flex: 1, backgroundColor: '#334155' }}>
            <iframe
              src={viewPdfPub.downloadUrl || `/api/pdf-proxy?key=${encodeURIComponent(viewPdfPub.objectKey)}`}
              title={viewPdfPub.title || 'PDF Document'}
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      )}
    </LecturerShell>
  );
}

export default LecturerPublicationsView;
