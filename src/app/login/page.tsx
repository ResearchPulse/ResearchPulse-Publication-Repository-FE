'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks';
import { HyperdataLogo } from '@/components/hyperdata-logo';
import { ScrollRevealObserver } from '@/components/scroll-reveal';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/student/my-preprints';
  const { refresh } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Vui lòng nhập tên đăng nhập/email và mật khẩu.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(data?.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        setLoading(false);
        return;
      }

      // Refresh auth state in React context
      await refresh();

      // Navigate to destination
      const role = data?.user?.role;
      const target = nextPath && nextPath !== '/' ? nextPath : (role === 'ADMIN' ? '/admin/dashboard' : '/student/my-preprints');
      router.push(target);
      router.refresh();
    } catch {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  return (
    <div className="public-landing">
      <ScrollRevealObserver />
      <a className="pl-skip-link" href="#main-content">Chuyển đến nội dung chính</a>

      {/* Floating Ambient Background Lights */}
      <div className="auth-ambient-glow auth-ambient-glow--1" aria-hidden="true" />
      <div className="auth-ambient-glow auth-ambient-glow--2" aria-hidden="true" />

      {/* Header - Aligned with Landing Page */}
      <header className="pl-header">
        <div className="pl-container pl-header__inner">
          <Link href="/" className="pl-brand" aria-label="Trang chủ ResearchPulse">
            <HyperdataLogo size={34} />
          </Link>

          <nav className="pl-nav" aria-label="Thanh điều hướng">
            <Link href="/#register-section" className="pl-nav__link">Đăng ký</Link>
            <Link href="/#portal" className="pl-nav__link">Cổng lưu trữ</Link>
            <Link href="/#features" className="pl-nav__link">Tính năng</Link>
            <Link href="/#faq" className="pl-nav__link">Hỏi đáp</Link>
          </nav>

          <div className="pl-header__actions">
            <Link href="/" className="pl-header-action pl-header-action--secondary">
              Về trang chủ
            </Link>
            <Link href="/#register-section" className="pl-header-action pl-header-action--primary">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (2-Column Grid with Smooth Entrance Animations) */}
      <main id="main-content" className="pl-section pl-hero" style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', padding: '60px 0 80px' }}>
        <div className="pl-container">
          <div className="pl-hero__grid" style={{ alignItems: 'center' }}>
            
            {/* Cột trái: Văn bản & Nhận diện Học thuật */}
            <div className="pl-hero__main pl-reveal">
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 18,
                  background: '#eef6fc',
                  color: '#0071bc',
                  padding: '6px 16px',
                  borderRadius: 9999,
                  fontSize: 13,
                  fontWeight: 700,
                  border: '1px solid #dbeef9',
                  transition: 'transform 0.3s ease',
                }}
              >
                🔐 Cổng Xác Thực Học Vụ Sinh Viên
              </span>

              <h1 className="pl-hero__title" style={{ fontSize: 'clamp(32px, 4.4vw, 54px)', marginBottom: 16 }}>
                Đăng nhập tài khoản <br />
                <span className="pl-hero__highlight">ResearchPulse.</span>
              </h1>

              <p className="pl-hero__desc" style={{ fontSize: 17, marginBottom: 32, maxWidth: 540 }}>
                Truy cập không gian nghiên cứu học thuật, quản lý bản thảo sớm và nhận đánh giá chuyên môn từ hội đồng giảng viên.
              </p>

              {/* 3 Bullet bảo chứng học thuật với hiệu ứng hover mượt mà */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontSize: 14, color: '#647381' }}>
                <div className="auth-bullet-item">
                  <div className="auth-bullet-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span>Sử dụng <strong>Tên đăng nhập học vụ</strong> (ví dụ: <code style={{ color: '#0071bc', fontWeight: 700, background: '#f0f7fc', padding: '2px 6px', borderRadius: 6 }}>MinhNVSE150000</code>)</span>
                </div>

                <div className="auth-bullet-item">
                  <div className="auth-bullet-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span>Mật khẩu bảo mật gửi trực tiếp qua Email sinh viên</span>
                </div>

                <div className="auth-bullet-item">
                  <div className="auth-bullet-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <span>Phê duyệt minh bạch từ Ban Quản trị học viện</span>
                </div>
              </div>
            </div>

            {/* Cột phải: Form Đăng nhập có hiệu ứng nổi và hover */}
            <div className="pl-hero__form-wrap pl-reveal" style={{ '--delay': '120ms' } as React.CSSProperties}>
              <div className="auth-card" style={{ maxWidth: 480, margin: '0 auto' }}>
                <div style={{ marginBottom: 22, textAlign: 'left' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: '#122331', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                    Thông tin đăng nhập
                  </h2>
                  <p style={{ fontSize: 13, color: '#647381', margin: 0, lineHeight: 1.5 }}>
                    Nhập Tên đăng nhập học vụ (hoặc Email) cùng mật khẩu để tiếp tục.
                  </p>
                </div>

                {error && (
                  <div className="auth-alert-box" role="alert" style={{ marginBottom: 18 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <div>{error}</div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form" style={{ gap: 16 }}>
                  <div className="auth-field" style={{ gap: 6, textAlign: 'left' }}>
                    <label className="auth-label" htmlFor="identifier" style={{ fontSize: 13, fontWeight: 700, color: '#122331' }}>
                      Tên đăng nhập hoặc Email *
                    </label>
                    <input
                      id="identifier"
                      type="text"
                      autoComplete="username"
                      className="auth-input"
                      placeholder="MinhNVSE150000 hoặc student@fpt.edu.vn"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="auth-field" style={{ gap: 6, textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className="auth-label" htmlFor="password" style={{ fontSize: 13, fontWeight: 700, color: '#122331' }}>
                        Mật khẩu *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0071bc',
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '2px 4px',
                          borderRadius: 4,
                          transition: 'color 0.2s, background 0.2s',
                        }}
                      >
                        {showPassword ? 'Ẩn' : 'Hiện'} mật khẩu
                      </button>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="auth-input"
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    style={{
                      padding: '13px 20px',
                      fontSize: 15,
                      fontWeight: 700,
                      marginTop: 6,
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                        </svg>
                        <span>Đang xác thực tài khoản...</span>
                      </>
                    ) : (
                      <span>Đăng nhập</span>
                    )}
                  </button>
                </form>

                <div className="auth-card__footer" style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #e8eef2', fontSize: 13, color: '#647381', textAlign: 'center' }}>
                  Chưa có tài khoản sinh viên?{' '}
                  <Link href="/#register-section" style={{ color: '#0071bc', fontWeight: 700, textDecoration: 'none' }}>
                    Đăng ký tài khoản ngay
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer chuẩn đồng bộ với Landing Page */}
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
              <Link href="/#portal" className="pl-link">Cổng lưu trữ</Link>
              <Link href="/#features" className="pl-link">Tính năng cốt lõi</Link>
            </div>
            <div className="pl-footer__col">
              <h4>Tài nguyên</h4>
              <Link href="/#faq" className="pl-link">Hỏi đáp & Hướng dẫn</Link>
              <Link href="/#register-section" className="pl-link">Đăng ký sinh viên</Link>
            </div>
            <div className="pl-footer__col">
              <h4>Truy cập</h4>
              <Link href="/#register-section" className="pl-link">Tạo tài khoản</Link>
              <Link href="/login" className="pl-link">Đăng nhập</Link>
              <Link href="/admin/dashboard" className="pl-link">Trang Quản trị Admin</Link>
            </div>
          </div>
        </div>

        <div className="pl-container pl-footer__bottom">
          <p>© {new Date().getFullYear()} ResearchPulse. Tất cả các quyền được bảo lưu.</p>
          <p className="pl-footer__disclaimer">
            Nền tảng công bố học thuật phi lợi nhuận phục vụ sinh viên và nhà nghiên cứu trẻ.
          </p>
        </div>
      </footer>
    </div>
  );
}
