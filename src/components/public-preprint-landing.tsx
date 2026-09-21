'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Lenis from 'lenis';
import { HyperdataLogo } from './hyperdata-logo';
import { PublicPortalShowcase } from './public-portal-showcase';
import { ScrollRevealObserver } from './scroll-reveal';

// Helper for Vietnamese diacritic removal for live username preview
const VIETNAMESE_MAP: Record<string, string> = {
  à: 'a', á: 'a', ả: 'a', ã: 'a', ạ: 'a',
  ă: 'a', ắ: 'a', ằ: 'a', ẳ: 'a', ẵ: 'a', ặ: 'a',
  â: 'a', ấ: 'a', ầ: 'a', ẩ: 'a', ẫ: 'a', ậ: 'a',
  è: 'e', é: 'e', ẻ: 'e', ẽ: 'e', ẹ: 'e',
  ê: 'e', ế: 'e', ề: 'e', ể: 'e', ễ: 'e', ệ: 'e',
  ì: 'i', í: 'i', ỉ: 'i', ĩ: 'i', ị: 'i',
  ò: 'o', ó: 'o', ỏ: 'o', õ: 'o', ọ: 'o',
  ô: 'o', ố: 'o', ồ: 'o', ổ: 'o', ỗ: 'o', ộ: 'o',
  ơ: 'o', ớ: 'o', ờ: 'o', ở: 'o', ỡ: 'o', ợ: 'o',
  ù: 'u', ú: 'u', ủ: 'u', ũ: 'u', ụ: 'u',
  ư: 'u', ứ: 'u', ừ: 'u', ử: 'u', ữ: 'u', ự: 'u',
  ỳ: 'y', ý: 'y', ỷ: 'y', ỹ: 'y', ỵ: 'y',
  đ: 'd',
};

function removeTones(str: string): string {
  return str.split('').map((c) => VIETNAMESE_MAP[c.toLowerCase()] ?? c).join('');
}

let globalLenis: Lenis | null = null;

function scrollToRegister(e?: React.MouseEvent) {
  if (e) e.preventDefault();
  const el = document.getElementById('register-section');
  if (!el) return;

  if (globalLenis) {
    globalLenis.scrollTo(el, {
      offset: -96,
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      onComplete: () => {
        const input = el.querySelector('input');
        if (input) input.focus({ preventScroll: true });
      },
    });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const input = el.querySelector('input');
      if (input) input.focus({ preventScroll: true });
    }, 600);
  }
}

type PublicPublication = {
  id: string;
  title?: string | null;
  abstract?: string | null;
  discipline?: string | null;
  keywords?: string[];
  currentVersion?: { versionLabel: string; fileName: string } | null;
  authors?: Array<{ name: string; affiliation?: string | null }>;
  downloadUrl?: string;
};

function PublishedCatalogue() {
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<PublicPublication[]>([]);
  const [selected, setSelected] = useState<PublicPublication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [citationFormat, setCitationFormat] = useState<'APA' | 'IEEE' | 'BibTeX'>('APA');
  const [citationCopied, setCitationCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [selected]);

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

  useEffect(() => {
    fetch('/api/publications/public', { cache: 'no-store' })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body?.error?.message || 'Unable to load published papers.');
        return body;
      })
      .then((body) => {
        const serverItems = Array.isArray(body.data) ? body.data : (body.data?.items || []);
        setItems(serverItems);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const displayItems = useMemo(() => {
    return items.filter(item => {
      if (activeCategory !== 'Tất cả' && item.discipline !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.title?.toLowerCase().includes(q) && !item.abstract?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, activeCategory, searchQuery]);

  const categories = ['Tất cả', 'Khoa học Máy tính & Trí tuệ nhân tạo', 'Hệ thống Thông tin', 'Kỹ thuật Phần mềm', 'Khoa học Dữ liệu', 'Kinh tế & Quản lý'];

  const getFormattedCitation = (pub: PublicPublication, format: 'APA' | 'IEEE' | 'BibTeX') => {
    const authorsStr = pub.authors?.map(a => a.name).join(', ') || 'Tác giả';
    const year = new Date().getFullYear();
    const title = pub.title || 'Bản thảo nghiên cứu';
    if (format === 'APA') return `${authorsStr} (${year}). ${title}. Hyperdata Lab Academic Repository, ${pub.currentVersion?.versionLabel || 'v1.0'}. https://hyperdatalab.org/preprints/${pub.id}`;
    if (format === 'IEEE') return `[1] ${authorsStr}, "${title}," Hyperdata Lab Preprint Rep., vol. 1, no. 1, ${year}.`;
    return `@article{hyperdatalab_${pub.id.slice(0, 8)},\n  title={${title}},\n  author={${authorsStr}},\n  journal={Hyperdata Lab Preprints},\n  year={${year}}\n}`;
  };

  const copyCitation = (pub: PublicPublication) => {
    navigator.clipboard.writeText(getFormattedCitation(pub, citationFormat));
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2200);
  };

  return (
    <section id="published" className="pl-published-section pl-reveal">
      <div className="pl-container">
        
        <div className="pl-published-head">
          <span className="pl-published-pill">
            <span style={{ fontSize: 16 }}>📚</span> Kho lưu trữ nghiên cứu mở · Open Access
          </span>
          <h2 className="pl-published-title">Công trình nghiên cứu tiêu biểu</h2>
          <p className="pl-published-desc">Khám phá các bản thảo khoa học của sinh viên đã hoàn tất bình duyệt học thuật chuyên sâu và được cấp quyền truy cập công khai.</p>
        </div>

        <div className="pl-published-category-tabs">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`pl-published-tab-btn ${activeCategory === cat ? 'pl-published-tab-btn--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="pl-published-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="pl-published-card" style={{ height: 240, opacity: 0.6 }}>
                <div className="skeleton-line" style={{ width: '40%', marginBottom: 16 }}></div>
                <div className="skeleton-line" style={{ width: '90%', height: 24, marginBottom: 12 }}></div>
                <div className="skeleton-line" style={{ width: '70%', height: 24, marginBottom: 24 }}></div>
                <div className="skeleton-line" style={{ width: '100%', height: 60 }}></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', borderRadius: 24, border: '1px dashed #cbd5e1', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ width: 80, height: 80, background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 4px 14px rgba(14, 165, 233, 0.15)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="1.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>Kho lưu trữ đang chờ đón bạn</h3>
            <p style={{ fontSize: 15, color: '#475569', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Hiện chưa có công trình nghiên cứu nào được công bố công khai. Hãy là người tiên phong đóng góp bản thảo học thuật của bạn vào hệ thống của Hyperdata Lab.
            </p>
            <a href="#register-section" onClick={scrollToRegister} className="pl-published-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontSize: 14.5 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Khởi tạo hồ sơ & Nộp công trình
            </a>
          </div>
        ) : (
          <>
            {displayItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: 20, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 16, color: '#64748b', margin: 0 }}>Không tìm thấy công trình nào phù hợp với bộ lọc hiện tại.</p>
                <button type="button" onClick={() => { setActiveCategory('Tất cả'); setSearchQuery(''); }} className="pl-published-btn-secondary" style={{ marginTop: 16 }}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                <div className="pl-published-grid">
                  {displayItems.map((item) => (
                    <div key={item.id} className="pl-published-card" onClick={() => handleSelectPaper(item)} role="button" tabIndex={0}>
                      <div>
                        <div className="pl-published-card-meta-row">
                          <span className="pl-published-tag">{item.discipline || 'Khoa học tổng hợp'}</span>
                          <span className="pl-published-version-tag">{item.currentVersion?.versionLabel || 'v1.0'}</span>
                        </div>
                        <h3 className="pl-published-card-title">{item.title || 'Bản thảo chưa có tiêu đề'}</h3>
                        
                        <div className="pl-published-card-authors">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
                          <span>{item.authors?.map((a) => a.name).join(' · ') || 'Tác giả'}</span>
                        </div>

                        <p className="pl-published-card-abstract">{item.abstract}</p>
                      </div>
                      
                      <div className="pl-published-card-footer">
                        <div style={{ display: 'flex', gap: 6, overflow: 'hidden' }}>
                          {item.keywords?.slice(0, 2).map(kw => (
                            <span key={kw} style={{ fontSize: 11, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: 12, whiteSpace: 'nowrap' }}>#{kw}</span>
                          ))}
                          {(item.keywords?.length || 0) > 2 && <span style={{ fontSize: 11, color: '#94a3b8' }}>+{item.keywords!.length - 2}</span>}
                        </div>
                        <span style={{ fontSize: 13, color: '#0071bc', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          Xem bài báo
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: 44 }}>
                  <a href="#register-section" onClick={scrollToRegister} className="pl-published-btn-primary" style={{ padding: '12px 24px', fontSize: 14.5 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Khởi tạo hồ sơ & Nộp công trình của bạn
                  </a>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {mounted && selected && createPortal(
        <div className="pl-published-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="pl-published-modal-panel" role="dialog" aria-modal="true">
            <button 
              type="button" 
              onClick={() => setSelected(null)} 
              style={{ position: 'absolute', top: 20, right: 20, background: '#f1f5f9', border: 'none', width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', transition: 'all 0.15s ease' }}
              title="Đóng"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div style={{ marginBottom: 20 }}>
              <span className="pl-published-tag" style={{ marginBottom: 12, display: 'inline-block' }}>{selected.discipline}</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', lineHeight: 1.35 }}>{selected.title}</h2>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, color: '#64748b', fontSize: 13.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>{selected.authors?.map((a) => a.name).join(' · ')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  <span>{selected.currentVersion?.versionLabel || 'Phiên bản chính thức'}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: 20, borderRadius: 14, marginBottom: 20, border: '1px solid #eef2f6' }}>
              <h4 style={{ fontSize: 12.5, textTransform: 'uppercase', color: '#0071bc', margin: '0 0 8px 0', fontWeight: 800, letterSpacing: '0.05em' }}>Tóm tắt nghiên cứu (Abstract)</h4>
              <p style={{ color: '#334155', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{selected.abstract}</p>
              
              {selected.keywords && selected.keywords.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                  {selected.keywords.map(kw => (
                    <span key={kw} style={{ fontSize: 12, background: '#e2e8f0', color: '#475569', padding: '3px 10px', borderRadius: 16, fontWeight: 600 }}>#{kw}</span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: '#f0fdf4', padding: 18, borderRadius: 14, marginBottom: 24, border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#166534' }}>
                  <span>📖 Trích dẫn công trình này:</span>
                  <div style={{ display: 'inline-flex', gap: 4, marginLeft: 6 }}>
                    {(['APA', 'IEEE', 'BibTeX'] as const).map(fmt => (
                      <button 
                        key={fmt} 
                        type="button" 
                        onClick={() => setCitationFormat(fmt)}
                        style={{ fontSize: 11.5, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: citationFormat === fmt ? '1px solid #16a34a' : '1px solid #cbd5e1', background: citationFormat === fmt ? '#16a34a' : '#ffffff', color: citationFormat === fmt ? '#ffffff' : '#475569', cursor: 'pointer' }}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => copyCitation(selected)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: citationCopied ? '#15803d' : '#0071bc', background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: 8, cursor: 'pointer' }}
                >
                  {citationCopied ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg><span>Đã sao chép!</span></>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Sao chép trích dẫn</span></>
                  )}
                </button>
              </div>

              <div style={{ fontSize: 13, color: '#14532d', background: '#ffffff', padding: '10px 14px', borderRadius: 8, border: '1px solid #dcfce7', fontFamily: 'monospace', lineHeight: 1.5, overflowX: 'auto' }}>
                {getFormattedCitation(selected, citationFormat)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setSelected(null)} className="pl-published-btn-secondary" style={{ padding: '10px 18px', fontSize: 13.5 }}>Đóng</button>
              {selected.downloadUrl && (
                <a href={selected.downloadUrl} target="_blank" rel="noreferrer" className="pl-published-btn-primary" style={{ padding: '10px 20px', fontSize: 13.5 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  Tải PDF chính thức
                </a>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}

export default function PublicPreprintLanding() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [major, setMajor] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ username: string; email: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });
    globalLenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const handleAnchorClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      // Skip empty hash or '#register-section' which is handled by scrollToRegister explicitly in many places
      if (!href || href === '#' || href.length < 2 || href === '#register-section') return;
      
      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        lenis.scrollTo(targetEl as HTMLElement, {
          offset: -96,
          duration: 1.1,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      globalLenis = null;
    };
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim() || !studentId.trim() || !email.trim() || !major.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          studentId: studentId.trim().toUpperCase(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          major: major.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đăng ký không thành công. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }

      setSuccessData({
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
      });
    } catch {
      setError('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="public-landing">
      <ScrollRevealObserver />
      <a className="pl-skip-link" href="#main-content">Chuyển đến nội dung chính</a>

      {/* Modern Sticky Glassmorphism Header */}
      <header className="pl-header">
        <div className="pl-container pl-header__inner">
          <Link href="/" className="pl-brand" aria-label="Trang chủ Hyperdata Lab">
            <HyperdataLogo size={34} />
          </Link>

          <nav className="pl-nav" aria-label="Thanh điều hướng chính">
            <a href="#register-section" onClick={scrollToRegister} className="pl-nav__link">Đăng ký</a>
            <a href="#portal" className="pl-nav__link">Cổng lưu trữ</a>
            <a href="#features" className="pl-nav__link">Tính năng</a>
            <a href="#workflow" className="pl-nav__link">Quy trình</a>
            <a href="#faq" className="pl-nav__link">Hỏi đáp</a>
          </nav>

          <div className="pl-header__actions">
            <Link href="/login" className="pl-header-action pl-header-action--secondary">
              Đăng nhập
            </Link>
            <a href="#register-section" onClick={scrollToRegister} className="pl-header-action pl-header-action--primary">
              Đăng ký ngay
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section with Embedded Registration Form */}
      <section id="main-content" className="pl-section pl-hero">
        <div className="pl-container">
          <div className="pl-hero__grid">
            {/* Left Column: Value Proposition */}
            <div className="pl-hero__main pl-reveal">
              <span className="pl-badge-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, background: '#eef6fc', color: '#0071bc', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                🎓 Cổng nghiên cứu khoa học sinh viên
              </span>
              <h1 className="pl-hero__title">
                Khám phá & Công bố công trình nghiên cứu{' '}
                <span className="pl-hero__highlight">vững chắc tương lai.</span>
              </h1>

              <p className="pl-hero__desc">
                Hyperdata Lab kết nối sinh viên học thuật với hội đồng giảng viên. Lưu trữ bản thảo sớm, nhận phản hồi bình duyệt bài viết và xây dựng hồ sơ học thuật xác thực.
              </p>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 24, fontSize: 14, color: '#647381' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Tự động sinh Tên đăng nhập theo MSSV</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Mật khẩu bảo mật gửi qua Email</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>Phê duyệt minh bạch từ Ban Quản trị</span>
                </div>
              </div>

              <div style={{ marginTop: 28 }}>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#0071bc', textDecoration: 'none' }}>
                  <span>Đã có tài khoản sinh viên? Đăng nhập ngay</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>

            {/* Right Column: Embedded Registration Card */}
            <div id="register-section" className="pl-hero__form-wrap pl-reveal" style={{ '--delay': '100ms' } as React.CSSProperties}>
              <div className="auth-card" style={{ maxWidth: '100%', margin: '0 auto', boxShadow: '0 16px 48px rgba(0, 113, 188, 0.12), 0 2px 8px rgba(18, 35, 49, 0.04)' }}>
                {successData ? (
                  <div className="auth-success-view">
                    <div className="auth-success-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>

                    <h2 className="auth-title" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>
                      Gửi yêu cầu thành công!
                    </h2>
                    <p className="auth-subtitle" style={{ fontSize: 13, color: '#647381', marginBottom: 18, lineHeight: 1.5 }}>
                      Cảm ơn <strong>{successData.name}</strong>. Yêu cầu của bạn đã được ghi nhận.
                    </p>

                    <div className="auth-notice-box" style={{ width: '100%', textAlign: 'left', marginBottom: 20, fontSize: 12.5, boxSizing: 'border-box', lineHeight: 1.5 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                      <div>
                        Yêu cầu cấp tài khoản của bạn sẽ được Ban Quản trị xem xét. Chúng tôi sẽ liên hệ qua <strong>{successData.email}</strong> để hướng dẫn các bước tiếp theo.
                      </div>
                    </div>

                    {/* Clean, perfectly proportioned actions */}
                    <div className="auth-success-actions">
                      <Link href="/login" className="auth-btn-success-primary">
                        <span>Đến trang Đăng nhập</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setSuccessData(null);
                          setLastName('');
                          setFirstName('');
                          setStudentId('');
                          setEmail('');
                          setPhone('');
                          setMajor('');
                        }}
                        className="auth-btn-success-secondary"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <line x1="19" y1="8" x2="19" y2="14" />
                          <line x1="22" y1="11" x2="16" y2="11" />
                        </svg>
                        <span>Gửi thêm yêu cầu khác</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 18 }}>
                      <h2 className="auth-title" style={{ fontSize: 20 }}>Đăng ký tài khoản Sinh viên</h2>
                      <p className="auth-subtitle" style={{ fontSize: 13, margin: 0 }}>
                        Điền thông tin để gửi yêu cầu cấp tài khoản nghiên cứu đến Ban Quản trị.
                      </p>
                    </div>

                    {error && (
                      <div className="auth-alert-box" role="alert" style={{ marginBottom: 14, fontSize: 12, padding: '10px 12px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <div>{error}</div>
                      </div>
                    )}

                    <form onSubmit={handleRegisterSubmit} className="auth-form" style={{ gap: 12 }}>
                      <div className="auth-row" style={{ gap: 10 }}>
                        <div className="auth-field" style={{ gap: 4 }}>
                          <label className="auth-label" htmlFor="hero-lastName" style={{ fontSize: 12 }}>
                            Họ & Tên đệm *
                          </label>
                          <input
                            id="hero-lastName"
                            type="text"
                            className="auth-input"
                            style={{ padding: '9px 12px', fontSize: 13 }}
                            placeholder="Nguyễn Văn"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            disabled={loading}
                            required
                          />
                        </div>

                        <div className="auth-field" style={{ gap: 4 }}>
                          <label className="auth-label" htmlFor="hero-firstName" style={{ fontSize: 12 }}>
                            Tên *
                          </label>
                          <input
                            id="hero-firstName"
                            type="text"
                            className="auth-input"
                            style={{ padding: '9px 12px', fontSize: 13 }}
                            placeholder="Minh"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-row" style={{ gap: 10 }}>
                        <div className="auth-field" style={{ gap: 4 }}>
                          <label className="auth-label" htmlFor="hero-studentId" style={{ fontSize: 12 }}>
                            Mã số sinh viên (MSSV) *
                          </label>
                          <input
                            id="hero-studentId"
                            type="text"
                            className="auth-input"
                            style={{ padding: '9px 12px', fontSize: 13 }}
                            placeholder="SE150000"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            disabled={loading}
                            required
                          />
                        </div>

                        <div className="auth-field" style={{ gap: 4 }}>
                          <label className="auth-label" htmlFor="hero-major" style={{ fontSize: 12 }}>
                            Chuyên ngành *
                          </label>
                          <input
                            id="hero-major"
                            type="text"
                            className="auth-input"
                            style={{ padding: '9px 12px', fontSize: 13 }}
                            placeholder="Kỹ thuật phần mềm"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            disabled={loading}
                            required
                          />
                        </div>
                      </div>

                      <div className="auth-row" style={{ gap: 10 }}>
                        <div className="auth-field" style={{ gap: 4 }}>
                          <label className="auth-label" htmlFor="hero-email" style={{ fontSize: 12 }}>
                            Địa chỉ Email *
                          </label>
                          <input
                            id="hero-email"
                            type="email"
                            className="auth-input"
                            style={{ padding: '9px 12px', fontSize: 13 }}
                            placeholder="student@fpt.edu.vn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                          />
                        </div>

                        <div className="auth-field" style={{ gap: 4 }}>
                          <label className="auth-label" htmlFor="hero-phone" style={{ fontSize: 12 }}>
                            Số điện thoại
                          </label>
                          <input
                            id="hero-phone"
                            type="tel"
                            className="auth-input"
                            style={{ padding: '9px 12px', fontSize: 13 }}
                            placeholder="0912345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="auth-btn auth-btn--primary"
                        style={{ padding: '11px 16px', fontSize: 14, marginTop: 4 }}
                        disabled={loading}
                      >
                        {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu đăng ký'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Layered Showcase Mockup */}
          <div id="portal" className="pl-hero__showcase-wrap pl-reveal" style={{ '--delay': '120ms', marginTop: 64 } as React.CSSProperties}>
            <PublicPortalShowcase />
          </div>

          <PublishedCatalogue />

          {/* 3 Bento Feature Cards */}
          <div id="features" className="pl-bento-grid">
            <div className="pl-bento-card pl-reveal" style={{ '--delay': '0ms' } as React.CSSProperties}>
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Tải lên & Đóng dấu bản thảo</h3>
              <p className="pl-bento-desc">
                Đăng ký bản thảo sớm với mã SHA-256 xác thực, khẳng định quyền ưu tiên học thuật mà không làm mất bản quyền công bố tạp chí.
              </p>
              <a href="#register-section" onClick={scrollToRegister} className="pl-bento-link">
                <span>Tạo tài khoản nộp bài</span>
                <svg className="pl-bento-link__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            <div className="pl-bento-card pl-reveal" style={{ '--delay': '120ms' } as React.CSSProperties}>
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Đồng hành cùng Giảng viên</h3>
              <p className="pl-bento-desc">
                Nhận phản hồi nhận xét phương pháp luận và hướng dẫn từng mục từ giảng viên trường để nâng cao chất lượng nghiên cứu.
              </p>
              <a href="#faq" className="pl-bento-link">
                <span>Xem quy trình bình duyệt</span>
                <svg className="pl-bento-link__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </a>
            </div>

            <div className="pl-bento-card pl-reveal" style={{ '--delay': '240ms' } as React.CSSProperties}>
              <div className="pl-bento-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="pl-bento-title">Kiểm duyệt & Quản trị</h3>
              <p className="pl-bento-desc">
                Phân định rõ ràng giữa bản thảo Preprint và công trình đã xuất bản chính thức, được bảo chứng bởi hội đồng quản trị học viện.
              </p>
              <a href="#faq" className="pl-bento-link">
                <span>Tìm hiểu trong Hỏi & Đáp</span>
                <svg className="pl-bento-link__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 12h16M14 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Academic Trust & Community Banner */}
          <div id="advisory" className="pl-trust-banner pl-reveal">
            <div className="pl-trust-quote">
              <div className="pl-trust-avatar" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5.5h16v13H4z" />
                  <path d="M8 9h8M8 13h5M8 16h3" />
                </svg>
              </div>
              <div>
                <p className="pl-trust-text">
                  &ldquo;Hyperdata Lab mang đến cho sinh viên một nền tảng minh bạch để đánh dấu thời gian nghiên cứu và trao đổi học thuật trực tiếp với hội đồng giảng viên.&rdquo;
                </p>
                <span className="pl-trust-author">Hội đồng Cố vấn Học thuật • Chương trình Nghiên cứu Khoa học Sinh viên</span>
              </div>
            </div>
            <div className="pl-trust-labels">
              <span className="pl-trust-label-head">CHUYÊN NGÀNH TIÊU BIỂU</span>
              <div className="pl-trust-tags">
                <span>Khoa học Máy tính</span>
                <span>Khoa học Dữ liệu</span>
                <span>Công nghệ Thông tin</span>
                <span>Kỹ thuật Phần mềm</span>
              </div>
            </div>
          </div>

          {/* Streamlined Publication Workflow Roadmap */}
          <div id="workflow" className="pl-workflow-section-wrap pl-reveal" style={{ '--delay': '80ms' } as React.CSSProperties}>
            <div className="pl-workflow-head">
              <span className="pl-workflow-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Lộ trình xuất bản khép kín
              </span>
              <h2 className="pl-workflow-title">Quy trình đăng bài trong hệ thống</h2>
              <p className="pl-workflow-desc">
                Hành trình 6 bước liền mạch và minh bạch, kết nối tác giả với hội đồng giảng viên từ khâu để lại thông tin đến khi công trình chính thức công bố mở.
              </p>
            </div>

            <div className="pl-workflow-timeline-wrapper">
              {/* Row 1: Giai đoạn 1 - Khởi tạo & Kích hoạt */}
              <div className="pl-workflow-row pl-workflow-row--1">
                {/* Step 01 */}
                <div className="pl-workflow-card pl-workflow-card--1">
                  <div className="pl-workflow-card-header">
                    <div className="pl-workflow-step-badge">
                      <span className="pl-workflow-step-num">01</span>
                      <span className="pl-workflow-step-name">KHỞI TẠO</span>
                    </div>
                    <div className="pl-workflow-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="pl-workflow-card-title">Để lại thông tin</h3>
                  <p className="pl-workflow-card-desc">
                    Sinh viên đăng ký trực tuyến với Họ tên, Mã số sinh viên (MSSV), Chuyên ngành và Email học tập để bắt đầu thiết lập hồ sơ tác giả.
                  </p>
                  <a href="#register-section" onClick={scrollToRegister} className="pl-workflow-card-action" style={{ textDecoration: 'none' }}>
                    <span>Khởi tạo hồ sơ trực tuyến</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </a>
                </div>

                {/* Connector 01 -> 02 */}
                <div className="pl-workflow-connector-inline" aria-hidden="true">
                  <div className="pl-workflow-connector-line"></div>
                  <div className="pl-workflow-connector-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Step 02 */}
                <div className="pl-workflow-card pl-workflow-card--2">
                  <div className="pl-workflow-card-header">
                    <div className="pl-workflow-step-badge">
                      <span className="pl-workflow-step-num">02</span>
                      <span className="pl-workflow-step-name">KẾT NỐI</span>
                    </div>
                    <div className="pl-workflow-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="pl-workflow-card-title">Giảng viên liên hệ</h3>
                  <p className="pl-workflow-card-desc">
                    Giảng viên hướng dẫn hoặc Ban cố vấn khoa học kết nối trực tiếp với sinh viên nhằm xác minh thông tin và định hướng phạm vi đề tài nghiên cứu.
                  </p>
                  <div className="pl-workflow-card-action">
                    <span>Tư vấn &amp; Thẩm định sơ bộ</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Connector 02 -> 03 */}
                <div className="pl-workflow-connector-inline" aria-hidden="true">
                  <div className="pl-workflow-connector-line"></div>
                  <div className="pl-workflow-connector-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Step 03 */}
                <div className="pl-workflow-card pl-workflow-card--3">
                  <div className="pl-workflow-card-header">
                    <div className="pl-workflow-step-badge">
                      <span className="pl-workflow-step-num">03</span>
                      <span className="pl-workflow-step-name">KÍCH HOẠT</span>
                    </div>
                    <div className="pl-workflow-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="pl-workflow-card-title">Cung cấp tài khoản</h3>
                  <p className="pl-workflow-card-desc">
                    Quản trị viên (Admin) phê duyệt cấp tài khoản. Tên đăng nhập được tự động đồng bộ theo chuẩn MSSV và mật khẩu tạm thời được gửi về email trường.
                  </p>
                  <div className="pl-workflow-card-action">
                    <span>Kích hoạt quyền tác giả</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              </div>

              {/* Transition Divider: Giai đoạn 2 */}
              <div className="pl-workflow-divider">
                <div className="pl-workflow-divider-line"></div>
                <div className="pl-workflow-divider-pill">
                  <span className="pl-workflow-divider-dot"></span>
                  <span>Giai đoạn 2: Nộp bản thảo &amp; Bình duyệt học thuật</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <div className="pl-workflow-divider-line"></div>
              </div>

              {/* Row 2: Giai đoạn 2 - Nộp bài, Review & Publish */}
              <div className="pl-workflow-row pl-workflow-row--2">
                {/* Step 04 */}
                <div className="pl-workflow-card pl-workflow-card--4">
                  <div className="pl-workflow-card-header">
                    <div className="pl-workflow-step-badge">
                      <span className="pl-workflow-step-num">04</span>
                      <span className="pl-workflow-step-name">TẢI LÊN</span>
                    </div>
                    <div className="pl-workflow-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="pl-workflow-card-title">Gửi bài nghiên cứu</h3>
                  <p className="pl-workflow-card-desc">
                    Tác giả tải lên file bản thảo PDF. Nền tảng tự động bóc tách siêu dữ liệu học thuật qua GROBID và đóng dấu SHA-256 xác lập bản quyền sớm.
                  </p>
                  <div className="pl-workflow-card-action">
                    <span>Bóc tách PDF &amp; Đóng dấu hash</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Connector 04 -> 05 */}
                <div className="pl-workflow-connector-inline" aria-hidden="true">
                  <div className="pl-workflow-connector-line"></div>
                  <div className="pl-workflow-connector-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Step 05 */}
                <div className="pl-workflow-card pl-workflow-card--5">
                  <div className="pl-workflow-card-header">
                    <div className="pl-workflow-step-badge">
                      <span className="pl-workflow-step-num">05</span>
                      <span className="pl-workflow-step-name">PHẢN BIỆN</span>
                    </div>
                    <div className="pl-workflow-icon-box">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="pl-workflow-card-title">Giảng viên review</h3>
                  <p className="pl-workflow-card-desc">
                    Giảng viên chuyên môn trực tiếp thẩm định phương pháp luận, cho điểm phản biện và hỗ trợ sinh viên sửa đổi, nâng cấp phiên bản (v2.0, v3.0).
                  </p>
                  <div className="pl-workflow-card-action">
                    <span>Bình duyệt &amp; Hướng dẫn sửa đổi</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Connector 05 -> 06 */}
                <div className="pl-workflow-connector-inline" aria-hidden="true">
                  <div className="pl-workflow-connector-line pl-workflow-connector-line--success"></div>
                  <div className="pl-workflow-connector-arrow pl-workflow-connector-arrow--success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                {/* Step 06 - Highlighted Destination */}
                <div className="pl-workflow-card pl-workflow-card--6 pl-workflow-card--final">
                  <div className="pl-workflow-card-header">
                    <div className="pl-workflow-step-badge pl-workflow-step-badge--final">
                      <span className="pl-workflow-step-num">06</span>
                      <span className="pl-workflow-step-name">XUẤT BẢN</span>
                    </div>
                    <div className="pl-workflow-icon-box pl-workflow-icon-box--final">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="pl-workflow-card-title">Công bố mở (Publish)</h3>
                  <p className="pl-workflow-card-desc">
                    Bản thảo chính thức được cấp quyền truy cập mở, xuất hiện trên kho lưu trữ Hyperdata Lab và sẵn sàng cho việc trích dẫn học thuật vĩnh viễn.
                  </p>
                  <div className="pl-workflow-card-action pl-workflow-card-action--final">
                    <span>Lưu trữ mở &amp; Trích dẫn toàn cầu</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action Banner inside Roadmap */}
            <div className="pl-workflow-banner pl-reveal" style={{ '--delay': '160ms' } as React.CSSProperties}>
              <div className="pl-workflow-banner-content">
                <h4>Bắt đầu công trình nghiên cứu đầu tiên của bạn</h4>
                <p>Chỉ mất 2 phút để hoàn tất đăng ký thông tin ban đầu và nhận hướng dẫn trực tiếp từ giảng viên.</p>
              </div>
              <a href="#register-section" onClick={scrollToRegister} className="pl-workflow-banner-btn">
                <span>Đăng ký tham gia ngay</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Pre-Footer FAQ Section */}
      <section id="faq" className="pl-section pl-section--alt pl-faq-prefooter pl-reveal">
        <div className="pl-container pl-container--narrow">
          <div className="pl-section-head">
            <h2 className="pl-section-title">Câu hỏi thường gặp</h2>
            <p className="pl-section-subtitle">
              Mọi điều bạn cần biết về bản thảo nghiên cứu sinh viên, quy trình phản biện và quyền tác giả.
            </p>
          </div>

          <div className="pl-faq-list">
            <details className="pl-faq-item" open>
              <summary className="pl-faq-question">
                <span>Bản thảo Preprint là gì và có ảnh hưởng đến việc xuất bản tạp chí không?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Preprint là bản thảo sơ bộ do tác giả sở hữu, được chia sẻ trước khi bình duyệt chính thức. Hầu hết các nhà xuất bản uy tín (IEEE, Elsevier, Springer, ACM...) đều cho phép công bố preprint trước khi gửi bài chính thức.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Ai có thể đăng ký tài khoản và gửi bản thảo?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Sinh viên, học viên cao học và giảng viên đều có thể đăng ký trực tiếp bằng Mã số sinh viên (MSSV) và Email học tập. Tài khoản sẽ được kích hoạt sau khi Quản trị viên (Admin) phê duyệt.
              </div>
            </details>

            <details className="pl-faq-item">
              <summary className="pl-faq-question">
                <span>Tôi có thể cập nhật bản thảo sau khi đã tải lên không?</span>
                <span className="pl-faq-icon" aria-hidden="true">+</span>
              </summary>
              <div className="pl-faq-answer">
                Có. Khi nhận được góp ý từ giảng viên hoặc hoàn thiện thêm kết quả, bạn có thể tải lên các phiên bản sửa đổi (v2.0, v3.0...). Mọi phiên bản đều được lưu vết minh bạch theo thời gian.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="pl-footer">
        <div className="pl-container pl-footer__inner">
          <div className="pl-footer__brand">
            <HyperdataLogo size={32} />
            <p className="pl-footer__tagline">
              Hạ tầng học thuật mở hỗ trợ nghiên cứu sớm cho sinh viên, đồng hành cùng giảng viên và minh bạch hóa quy trình công bố khoa học.
            </p>
          </div>

          <div className="pl-footer__links">
            <div className="pl-footer__col">
              <h4>Nền tảng</h4>
              <a href="#portal" className="pl-link">Cổng lưu trữ</a>
              <a href="#features" className="pl-link">Tính năng cốt lõi</a>
              <a href="#workflow" className="pl-link">Quy trình xuất bản</a>
              <a href="#advisory" className="pl-link">Hội đồng cố vấn</a>
            </div>
            <div className="pl-footer__col">
              <h4>Tài nguyên</h4>
              <a href="#faq" className="pl-link">Hỏi đáp & Hướng dẫn</a>
              <Link href="/login" className="pl-link">Cổng đăng nhập</Link>
              <a href="#register-section" onClick={scrollToRegister} className="pl-link">Đăng ký sinh viên</a>
            </div>
            <div className="pl-footer__col">
              <h4>Truy cập</h4>
              <a href="#register-section" onClick={scrollToRegister} className="pl-link">Tạo tài khoản</a>
              <Link href="/login" className="pl-link">Đăng nhập</Link>
              <Link href="/admin/dashboard" className="pl-link">Trang Quản trị Admin</Link>
            </div>
          </div>
        </div>

        <div className="pl-container pl-footer__bottom">
          <p>© {new Date().getFullYear()} Hyperdata Lab. Tất cả các quyền được bảo lưu.</p>
          <p className="pl-footer__disclaimer">
            Nền tảng công bố học thuật phi lợi nhuận phục vụ sinh viên và nhà nghiên cứu trẻ.
          </p>
        </div>
      </footer>
    </div>
  );
}
