'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { HyperdataLogo } from '@/components/hyperdata-logo';

// Helper to remove Vietnamese tones on client side for live preview
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

export default function RegisterPage() {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [major, setMajor] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ username: string; email: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Live username generation preview
  const usernamePreview = useMemo(() => {
    if (!firstName.trim() || !studentId.trim()) return '';
    const cleanFirst = removeTones(firstName.trim());
    const cleanLast = removeTones(lastName.trim());
    const cleanId = studentId.trim().toUpperCase();

    const normalizedFirst = cleanFirst.charAt(0).toUpperCase() + cleanFirst.slice(1).toLowerCase();
    const initials = cleanLast
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');

    return `${normalizedFirst}${initials}${cleanId}`;
  }, [firstName, lastName, studentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim() || !studentId.trim() || !email.trim() || !major.trim()) {
      setError('Vui lòng điền đầy đủ tất cả các thông tin bắt buộc.');
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
          major: major.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại.');
        setLoading(false);
        return;
      }

      setSuccessData({
        username: data.user.username,
        email: data.user.email,
        name: data.user.name,
      });
    } catch (err) {
      setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link href="/" className="auth-header__logo" aria-label="Hyperdata Lab Home">
          <HyperdataLogo size={28} />
          <span>Hyperdata Lab</span>
        </Link>
        <Link href="/login" className="auth-header__back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Quay lại đăng nhập</span>
        </Link>
      </header>

      <main className="auth-container">
        <div className="auth-card auth-card--wide">
          {successData ? (
            <div className="auth-success-view">
              <div className="auth-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="auth-title" style={{ fontSize: 22, fontWeight: 800, margin: '0 0 6px' }}>Đăng ký thành công!</h2>
              <p className="auth-subtitle" style={{ fontSize: 13, color: '#647381', marginBottom: 18, lineHeight: 1.5 }}>
                Chào mừng <strong>{successData.name}</strong>. Tài khoản sinh viên của bạn đã được khởi tạo:
              </p>

              <div className="auth-preview-badge" style={{ width: '100%', marginBottom: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tên đăng nhập (Username)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0071bc', fontFamily: 'monospace', letterSpacing: '0.05em', marginTop: 2 }}>{successData.username}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(successData.username);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="auth-copy-btn"
                  title="Sao chép tên đăng nhập"
                >
                  {copied ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                      <span>Đã sao chép</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              <div className="auth-notice-box" style={{ width: '100%', textAlign: 'left', marginBottom: 20, fontSize: 12.5, boxSizing: 'border-box', lineHeight: 1.5 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <div>
                  <strong>Bước tiếp theo:</strong>
                  <br />
                  1. Mật khẩu ngẫu nhiên đã được gửi về email <strong>{successData.email}</strong>.
                  <br />
                  2. Tài khoản đang chờ <strong>Quản trị viên (Admin) phê duyệt</strong> trước khi có thể đăng nhập.
                </div>
              </div>

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
                  <span>Đăng ký tài khoản khác</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="auth-title">Đăng ký tài khoản Sinh viên</h1>
              <p className="auth-subtitle">
                Điền thông tin học vụ để khởi tạo tài khoản nghiên cứu. Username sẽ được tạo tự động theo MSSV.
              </p>

              {error && (
                <div className="auth-alert-box" role="alert" style={{ marginBottom: 18 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-row">
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="lastName">
                      Họ và tên đệm *
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      className="auth-input"
                      placeholder="Ví dụ: Nguyễn Văn"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="firstName">
                      Tên *
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      className="auth-input"
                      placeholder="Ví dụ: Duy"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="auth-row">
                  <div className="auth-field">
                    <label className="auth-label" htmlFor="studentId">
                      Mã số sinh viên (MSSV) *
                    </label>
                    <input
                      id="studentId"
                      type="text"
                      className="auth-input"
                      placeholder="Ví dụ: SE150000"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="auth-field">
                    <label className="auth-label" htmlFor="major">
                      Chuyên ngành *
                    </label>
                    <input
                      id="major"
                      type="text"
                      className="auth-input"
                      placeholder="Ví dụ: Software Engineering"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="auth-field">
                  <label className="auth-label" htmlFor="email">
                    Địa chỉ Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="auth-input"
                    placeholder="email@fpt.edu.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                {usernamePreview && (
                  <div className="auth-preview-badge">
                    <span className="auth-preview-badge__label">Tên đăng nhập dự kiến:</span>
                    <span className="auth-preview-badge__value">{usernamePreview}</span>
                  </div>
                )}

                <div className="auth-notice-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>
                    Mật khẩu ngẫu nhiên sẽ được gửi về email của bạn. Tài khoản cần được Admin duyệt trước khi đăng nhập.
                  </span>
                </div>

                <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
                  {loading ? 'Đang khởi tạo tài khoản...' : 'Đăng ký tài khoản'}
                </button>
              </form>

              <div className="auth-card__footer">
                Đã có tài khoản? <Link href="/login">Đăng nhập tại đây</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
