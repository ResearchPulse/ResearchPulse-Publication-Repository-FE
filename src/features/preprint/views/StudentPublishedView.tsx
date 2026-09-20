'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { StudentShell } from '../components';
import { useTranslation } from '@/i18n';

export type PublicPublication = {
  id: string;
  title?: string | null;
  abstract?: string | null;
  discipline?: string | null;
  keywords?: string[];
  publishedAt?: Date | string | null;
  currentVersion?: { versionLabel: string; fileName: string } | null;
  authors?: Array<{ name: string; affiliation?: string | null }>;
  downloadUrl?: string;
};

export function StudentPublishedView() {
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<PublicPublication[]>([]);
  const [selected, setSelected] = useState<PublicPublication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [citationFormat, setCitationFormat] = useState<'APA' | 'IEEE' | 'BibTeX'>('APA');
  const [citationCopied, setCitationCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [selected]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch('/api/publications/public', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error?.message || 'Unable to load published papers.');
        return body;
      })
      .then((body) => {
        if (!active) return;
        const serverItems = Array.isArray(body.data) ? body.data : (body.data?.items || []);
        setItems(serverItems);
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unable to load papers.');
        setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectPaper = async (paper: PublicPublication) => {
    setSelected(paper);
    try {
      const res = await fetch(`/api/publications/public/${paper.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data?.downloadUrl) {
          setSelected((prev) => (prev && prev.id === paper.id ? { ...prev, downloadUrl: json.data.downloadUrl } : prev));
        }
      }
    } catch {
      // keep basic paper data if detail fetch fails
    }
  };

  const displayItems = useMemo(() => {
    return items.filter((item) => {
      if (activeCategory !== 'ALL' && item.discipline !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(q);
        const matchAbstract = item.abstract?.toLowerCase().includes(q);
        const matchKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
        const matchAuthors = item.authors?.some((a) => a.name.toLowerCase().includes(q));
        if (!matchTitle && !matchAbstract && !matchKeywords && !matchAuthors) return false;
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  const categories = useMemo(() => {
    const defaultCategories = [
      'ALL',
      'Khoa học Máy tính & Trí tuệ nhân tạo',
      'Hệ thống Thông tin',
      'Kỹ thuật Phần mềm',
      'Khoa học Dữ liệu',
      'Kinh tế & Quản lý',
    ];
    const presentCats = new Set<string>();
    items.forEach((item) => {
      if (item.discipline) presentCats.add(item.discipline);
    });
    return Array.from(new Set([...defaultCategories, ...Array.from(presentCats)]));
  }, [items]);

  const getFormattedCitation = (pub: PublicPublication, format: 'APA' | 'IEEE' | 'BibTeX') => {
    const authorsStr = pub.authors?.map((a) => a.name).join(', ') || (locale === 'vi' ? 'Tác giả' : 'Author');
    const year = pub.publishedAt ? new Date(pub.publishedAt).getFullYear() : new Date().getFullYear();
    const title = pub.title || (locale === 'vi' ? 'Bản thảo nghiên cứu' : 'Research Preprint');
    if (format === 'APA') {
      return `${authorsStr} (${year}). ${title}. Hyperdata Lab Academic Repository, ${pub.currentVersion?.versionLabel || 'v1.0'}. https://hyperdatalab.org/preprints/${pub.id}`;
    }
    if (format === 'IEEE') {
      return `[1] ${authorsStr}, "${title}," Hyperdata Lab Preprint Rep., vol. 1, no. 1, ${year}.`;
    }
    return `@article{hyperdatalab_${pub.id.slice(0, 8)},\n  title={${title}},\n  author={${authorsStr}},\n  journal={Hyperdata Lab Preprints},\n  year={${year}}\n}`;
  };

  const copyCitation = (pub: PublicPublication) => {
    navigator.clipboard.writeText(getFormattedCitation(pub, citationFormat));
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2200);
  };

  return (
    <StudentShell title={t('student.topbar.publishedTitle')} showStandardHeader={false}>
      {/* Page Header */}
      <div className="student-page-header">
        <div className="student-page-header__content">
          <h1 className="student-page-header__title">{locale === 'vi' ? 'Kho bài báo công khai' : 'Published Papers'}</h1>
          <p className="student-page-header__subtitle">
            {locale === 'vi'
              ? 'Khám phá và tham khảo các công trình nghiên cứu của cộng đồng sinh viên và giảng viên đã được xuất bản chính thức.'
              : 'Explore, read, and cite officially published scientific preprints from our academic community.'}
          </p>
        </div>
      </div>

      {error && (
        <div className="dashboard-alert-banner" style={{ marginBottom: '20px' }}>
          <div className="dashboard-alert-banner__content">
            <strong className="dashboard-alert-banner__title">Error loading papers</strong>
            <p className="dashboard-alert-banner__desc">{error}</p>
          </div>
        </div>
      )}

      {/* Metrics Strip */}
      <div className="student-metrics-grid" style={{ marginBottom: '20px' }}>
        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{items.length}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Tổng số bài báo xuất bản' : 'Total Published Papers'}</span>
          </div>
        </div>
        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{categories.length - 1}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Lĩnh vực nghiên cứu' : 'Academic Disciplines'}</span>
          </div>
        </div>
        <div className="student-metric-card">
          <div className="student-metric-info">
            <span className="student-metric-value">{displayItems.length}</span>
            <span className="student-metric-label">{locale === 'vi' ? 'Kết quả hiển thị' : 'Matching Results'}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="student-filter-toolbar">
        {/* Category Tabs */}
        <div className="student-tabs-pills" role="tablist" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`student-tab-pill ${activeCategory === cat ? 'student-tab-pill--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'ALL' ? (locale === 'vi' ? 'Tất cả lĩnh vực' : 'All Disciplines') : cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="student-toolbar-actions">
          <div className="student-search-box" style={{ width: '320px' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder={locale === 'vi' ? 'Tìm bài báo, tác giả, từ khóa...' : 'Search title, author, keyword...'}
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
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ height: '220px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : displayItems.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginTop: '20px' }}>
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectPaper(item)}
              role="button"
              tabIndex={0}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '24px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0071bc';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -6px rgba(0, 113, 188, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.04)';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0071bc', background: '#e0f2fe', padding: '3px 9px', borderRadius: '6px' }}>
                    {item.discipline || (locale === 'vi' ? 'Khoa học tổng quát' : 'General Science')}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                    {item.currentVersion?.versionLabel || 'v1.0'}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0', lineHeight: 1.45 }}>
                  {item.title}
                </h3>

                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.authors?.map((a) => a.name).join(', ') || (locale === 'vi' ? 'Tác giả ẩn danh' : 'Unknown Author')}
                  </span>
                </div>

                {item.abstract && (
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.abstract}
                  </p>
                )}
              </div>

              <div>
                {item.keywords && item.keywords.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {item.keywords.slice(0, 3).map((kw) => (
                      <span key={kw} style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        #{kw}
                      </span>
                    ))}
                    {item.keywords.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>+{item.keywords.length - 3}</span>
                    )}
                  </div>
                )}

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-US') : ''}
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#0071bc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {locale === 'vi' ? 'Xem & Trích dẫn' : 'View & Cite'}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
            {locale === 'vi' ? 'Không có bài báo nào phù hợp' : 'No published papers found'}
          </div>
          <div style={{ fontSize: '13.5px', color: '#64748b' }}>
            {locale === 'vi' ? 'Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.' : 'Try adjusting your search criteria or clearing active filters.'}
          </div>
          {(activeCategory !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#0071bc',
                color: '#ffffff',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {locale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters'}
            </button>
          )}
        </div>
      )}

      {/* Modal Detail & Citation */}
      {mounted && selected && createPortal(
        <div
          className="pl-published-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
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
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '32px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            }}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
              title={locale === 'vi' ? 'Đóng' : 'Close'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0071bc', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '12px' }}>
                {selected.discipline || (locale === 'vi' ? 'Khoa học tổng quát' : 'General Science')}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                {selected.title}
              </h2>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', color: '#64748b', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>{selected.authors?.map((a) => a.name).join(' · ') || (locale === 'vi' ? 'Tác giả ẩn danh' : 'Unknown')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>{selected.currentVersion?.versionLabel || 'v1.0'}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#0071bc', margin: '0 0 8px 0', fontWeight: 800, letterSpacing: '0.05em' }}>
                {locale === 'vi' ? 'Tóm tắt nghiên cứu (Abstract)' : 'Abstract'}
              </h4>
              <p style={{ color: '#334155', fontSize: '14px', lineHeight: 1.65, margin: 0 }}>
                {selected.abstract || (locale === 'vi' ? 'Không có tóm tắt.' : 'No abstract provided.')}
              </p>

              {selected.keywords && selected.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                  {selected.keywords.map((kw) => (
                    <span key={kw} style={{ fontSize: '12px', background: '#e2e8f0', color: '#475569', padding: '3px 10px', borderRadius: '16px', fontWeight: 600 }}>
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Citation Box */}
            <div style={{ background: '#f0fdf4', padding: '18px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                  <span>{locale === 'vi' ? '📖 Trích dẫn bài báo này:' : '📖 Cite this paper:'}</span>
                  <div style={{ display: 'inline-flex', gap: '4px', marginLeft: '6px' }}>
                    {(['APA', 'IEEE', 'BibTeX'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setCitationFormat(fmt)}
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: citationFormat === fmt ? '1px solid #16a34a' : '1px solid #cbd5e1',
                          background: citationFormat === fmt ? '#16a34a' : '#ffffff',
                          color: citationFormat === fmt ? '#ffffff' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyCitation(selected)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: citationCopied ? '#15803d' : '#0071bc',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
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
                {getFormattedCitation(selected, citationFormat)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  padding: '10px 18px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  background: '#f1f5f9',
                  color: '#475569',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                }}
              >
                {locale === 'vi' ? 'Đóng' : 'Close'}
              </button>
              {selected.downloadUrl && (
                <a
                  href={selected.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '10px 20px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    background: '#0071bc',
                    color: '#ffffff',
                    borderRadius: '8px',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  {locale === 'vi' ? 'Tải PDF chính thức' : 'Download PDF'}
                </a>
              )}
              <Link
                href={`/student/published/${selected.id}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '8px',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                {locale === 'vi' ? 'Trang chi tiết' : 'View Details'}
              </Link>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </StudentShell>
  );
}

export default StudentPublishedView;
