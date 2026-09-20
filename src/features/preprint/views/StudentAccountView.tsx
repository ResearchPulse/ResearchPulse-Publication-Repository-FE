'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/api/authApi';
import { StudentShell } from '../components';

export function StudentAccountView() {
  const { user, refresh, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    major: '',
  });

  // Sync form data whenever user changes or edit mode opens
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        studentId: user.studentId || '',
        major: user.major || '',
      });
    }
  }, [user, isEditing]);

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Sinh viên';
  const displayEmail = user?.email || 'Chưa cập nhật email';
  const displayRole = user?.role === 'STUDENT' ? 'Sinh viên / Tác giả nghiên cứu' : user?.role || 'Sinh viên';
  const displayMajor = user?.major || 'Chưa cập nhật';
  const displayStudentId = user?.studentId || 'Chưa thiết lập';

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name?.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'SV';
  };

  const initials = getInitials(user?.name, user?.email);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const res = await authApi.updateProfile({
        name: formData.name.trim() || undefined,
        studentId: formData.studentId.trim() || undefined,
        major: formData.major.trim() || undefined,
      });

      if (res.user) {
        updateUser(res.user);
      }
      await refresh();

      setSuccessMessage('Cập nhật hồ sơ tài khoản thành công!');
      setIsEditing(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <StudentShell title="Tài khoản" showStandardHeader={false}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Success Alert Banner */}
        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '13.5px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
              <span>{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#166534', fontSize: '16px', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Profile Header Card */}
        <div
          className="student-section-card"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            padding: '24px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#0071bc',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0, 113, 188, 0.25)',
              }}
            >
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>
                  {displayName}
                </h2>
                <span className="user-badge user-badge--approved">ĐÃ XÁC THỰC</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '13.5px', color: '#64748b' }}>
                {displayEmail} · <span style={{ color: '#0071bc', fontWeight: 600 }}>{displayRole}</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setErrorMessage(null);
              }}
              className="student-btn student-btn--secondary student-btn--sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                <path d="m15 5 4 4"/>
              </svg>
              <span>{isEditing ? 'Đóng chỉnh sửa' : 'Chỉnh sửa hồ sơ'}</span>
            </button>

            <button
              type="button"
              onClick={() => authApi.logout()}
              className="student-btn student-btn--secondary student-btn--sm"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* In-place Profile Edit Form */}
        {isEditing && (
          <div
            className="student-section-card"
            style={{
              padding: '24px',
              border: '1px solid #93c5fd',
              background: '#f8fafc',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  Cập nhật thông tin hồ sơ
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                  Thông tin sẽ được cập nhật trực tiếp vào tài khoản và đồng bộ với các bản thảo nghiên cứu của bạn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Mã số sinh viên (MSSV)
                  </label>
                  <input
                    type="text"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="Ví dụ: 2026-STEM-089"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Lĩnh vực nghiên cứu
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="Ví dụ: Trí tuệ nhân tạo, Xử lý ngôn ngữ tự nhiên"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      background: '#ffffff',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email (Cố định theo tài khoản)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={displayEmail}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '14px',
                      background: '#f1f5f9',
                      color: '#64748b',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="student-btn student-btn--secondary student-btn--sm"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="student-btn student-btn--primary student-btn--sm"
                  style={{ minWidth: '110px' }}
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Academic Details Card */}
        <div className="student-section-card" style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Thông tin cá nhân &amp; Học thuật
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {user?.updatedAt ? `Cập nhật: ${new Date(user.updatedAt).toLocaleDateString('vi-VN')}` : 'Đã xác thực hồ sơ'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              width: '100%',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Họ và tên
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {displayName}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Email tài khoản
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {displayEmail}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Vai trò trên hệ thống
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0071bc', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {displayRole}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Mã số sinh viên (MSSV)
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {displayStudentId}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Lĩnh vực nghiên cứu
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                {displayMajor}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>
                Trạng thái tài khoản
              </span>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#16a34a', padding: '10px 14px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                Đang hoạt động (Active)
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Card */}
        <div className="student-section-card" style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
            Bảo mật &amp; Phiên truy cập
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                gap: '12px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Mật khẩu đăng nhập</div>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>••••••••••••</div>
              </div>
              <a
                href="/reset-password"
                className="student-btn student-btn--secondary student-btn--sm"
              >
                Đổi mật khẩu
              </a>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                gap: '12px',
              }}
            >
              <div style={{ color: '#0071bc', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>Bảo mật phiên làm việc</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Xác thực HTTP-Only Cookie &amp; Bearer JWT an toàn
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}

export default StudentAccountView;
