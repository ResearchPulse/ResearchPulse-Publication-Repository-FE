'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { HyperdataLogo } from '@/components/hyperdata-logo';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Token đặt lại mật khẩu không hợp lệ hoặc thiếu.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không trùng khớp.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Đặt lại mật khẩu thất bại.');
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError('Không thể kết nối đến máy chủ.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {success ? (
        <div className="auth-success-view">
          <div className="auth-success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="auth-title">Đổi mật khẩu thành công!</h2>
          <p className="auth-subtitle">
            Mật khẩu của bạn đã được cập nhật. Bạn có thể sử dụng mật khẩu mới để đăng nhập (sau khi tài khoản được Admin duyệt).
          </p>
          <Link href="/login" className="auth-btn auth-btn--primary">
            Đến trang Đăng nhập
          </Link>
        </div>
      ) : (
        <>
          <h1 className="auth-title">Đặt lại mật khẩu</h1>
          <p className="auth-subtitle">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          {!token && (
            <div className="auth-alert-box" style={{ marginBottom: 18 }}>
              Không tìm thấy mã xác thực (Token). Vui lòng sử dụng đường link được gửi qua email của bạn.
            </div>
          )}

          {error && (
            <div className="auth-alert-box" style={{ marginBottom: 18 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label" htmlFor="newPassword">
                Mật khẩu mới (tối thiểu 8 ký tự)
              </label>
              <input
                id="newPassword"
                type="password"
                className="auth-input"
                placeholder="Nhập mật khẩu mới"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading || !token}
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="confirmPassword">
                Xác nhận mật khẩu mới
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="auth-input"
                placeholder="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || !token}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn auth-btn--primary"
              disabled={loading || !token}
            >
              {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Link href="/" className="auth-header__logo">
          <HyperdataLogo size={28} />
          <span>Hyperdata Lab</span>
        </Link>
        <Link href="/login" className="auth-header__back">
          <span>Về trang đăng nhập</span>
        </Link>
      </header>

      <main className="auth-container">
        <Suspense fallback={
          <div className="auth-card" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#64748b' }}>Đang tải trang đặt lại mật khẩu...</p>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
