'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { LecturerShell } from '../components/LecturerShell';
import { LanguageSwitcher, useTranslation } from '@/i18n';
import { lecturerReviewApi, type LecturerStats } from '../api';

export function LecturerProfileView() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<LecturerStats>({
    queryKey: ['lecturer', 'stats'],
    queryFn: () => lecturerReviewApi.getStats(),
    staleTime: 60 * 1000,
  });
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'User Profile';
  const displayEmail = user?.email || 'reviewer@hyperdata.org';

  const getInitials = (name?: string, email?: string) => {
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
    return 'U';
  };

  const initials = getInitials(user?.name, user?.email);

  return (
    <LecturerShell active="profile" title={locale === 'vi' ? 'Hồ sơ cá nhân' : 'Profile'} pendingCount={stats?.reviewQueue}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* 1. Academic Identity Hero Banner */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Large Avatar */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#0071bc',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: 800,
              flexShrink: 0,
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0, 113, 188, 0.25)',
            }}>
              {initials}
              <span style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2.5px solid #ffffff',
              }} aria-label="Online" />
            </div>

            {/* Name & Academic Title */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                  {displayName}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: '#e0f2fe',
                  color: '#0071bc',
                  fontSize: '11.5px',
                  fontWeight: 700,
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                  {user?.role === 'LECTURER' ? 'Verified Faculty Reviewer' : user?.role === 'ADMIN' ? 'System Administrator' : 'Student Scholar'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#64748b' }}>
                {user?.role === 'LECTURER' ? 'Faculty Reviewer · Department of Computer Science & Engineering' : user?.role === 'ADMIN' ? 'System Administrator · HyperData Lab' : 'Student Scholar · Science & Technology Faculty'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#0071bc', fontWeight: 500 }}>
                {displayEmail}
              </p>
            </div>
          </div>

          {/* Status Chip */}
          <div style={{
            padding: '8px 16px',
            borderRadius: '8px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            textAlign: 'right',
          }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {locale === 'vi' ? 'Trạng thái phản viên' : 'Reviewer Status'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', color: '#16a34a', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
              {locale === 'vi' ? 'Hoạt động · Mở hồ sơ thẩm định' : 'Active · Open Review Pool'}
            </div>
          </div>
        </div>

        {/* 2. Reviewer Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {locale === 'vi' ? 'Đã thẩm định' : 'Completed Reviews'}
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '8px 0 2px' }}>
              {statsLoading ? '—' : (stats?.completedReviews ?? 0)}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {locale === 'vi' ? 'Đánh giá chuyên gia đã nộp' : 'Peer evaluations submitted'}
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {locale === 'vi' ? 'Hàng đợi thẩm định' : 'Review Queue'}
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#0071bc', margin: '8px 0 2px' }}>
              {statsLoading ? '—' : (stats?.reviewQueue ?? 0)}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {locale === 'vi' ? 'Bản thảo trong khung thời gian xử lý' : 'Manuscript in active window'}
            </span>
          </div>

          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '20px',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {locale === 'vi' ? 'Tỷ lệ đúng hạn SLA' : 'Turnaround SLA'}
            </span>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', margin: '8px 0 2px' }}>
              {statsLoading ? '—' : (stats?.turnaroundSlaFormatted || `${stats?.turnaroundSla ?? 100}%`)}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {locale === 'vi' ? 'Phản hồi đúng hạn (mức chuẩn 48 giờ)' : 'On-time feedback (48h average)'}
            </span>
          </div>
        </div>

        {/* 3. Detailed Information Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}>
          {/* Card: Academic & Institutional Info */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {locale === 'vi' ? 'Thông tin học thuật & Đơn vị công tác' : 'Academic & Institutional Credentials'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'vi' ? 'Họ và tên học thuật' : 'Full Academic Name'}
                </span>
                <strong style={{ color: '#0f172a' }}>{displayName}</strong>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'vi' ? 'Địa chỉ Email' : 'Email Address'}
                </span>
                <span style={{ color: '#1e293b' }}>{displayEmail}</span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'vi' ? 'Vai trò tài khoản' : 'Account Role'}
                </span>
                <span style={{ color: '#0071bc', fontWeight: 600 }}>
                  {user?.role === 'LECTURER'
                    ? (locale === 'vi' ? 'Giảng viên phản biện (LECTURER)' : 'Faculty Reviewer (LECTURER)')
                    : user?.role === 'ADMIN'
                    ? (locale === 'vi' ? 'Quản trị viên hệ thống (ADMIN)' : 'System Administrator (ADMIN)')
                    : (locale === 'vi' ? 'Tác giả sinh viên (STUDENT)' : 'Student Author (STUDENT)')}
                </span>
              </div>

              {user?.studentId ? (
                <div>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {locale === 'vi' ? 'Mã Số Giảng Viên (MSGV)' : 'Lecturer Identifier (MSGV)'}
                  </span>
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                    {user.studentId}
                  </code>
                </div>
              ) : (
                <div>
                  <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {locale === 'vi' ? 'Mã định danh người dùng' : 'User ID'}
                  </span>
                  <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', color: '#334155' }}>
                    {user?.id ? user.id.slice(0, 16) + '…' : 'N/A'}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Card: Review Preferences & Scope */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {locale === 'vi' ? 'Phạm vi & Chuyên ngành thẩm định' : 'Peer Review Scope & Disciplines'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                  {locale === 'vi' ? 'Lĩnh vực chuyên môn phản biện' : 'Review Disciplines'}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {['Trí tuệ nhân tạo (AI)', 'Học máy (Machine Learning)', 'Xử lý ngôn ngữ tự nhiên', 'Hệ thống phân tán', 'Khoa học dữ liệu'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#334155',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'vi' ? 'Thời hạn thẩm định chuẩn' : 'Standard Review Window'}
                </span>
                <span style={{ color: '#1e293b' }}>
                  {locale === 'vi' ? '48–72 Giờ sau khi bản thảo được phân công thẩm định' : '48–72 Hours after a manuscript enters review'}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {locale === 'vi' ? 'Quy tắc hướng dẫn học thuật' : 'Peer Mentorship Policy'}
                </span>
                <span style={{ color: '#64748b', fontSize: '12.5px', lineHeight: 1.5 }}>
                  {locale === 'vi'
                    ? 'Đánh giá tập trung vào định hướng xây dựng, tính chặt chẽ về phương pháp và sự sẵn sàng cho xuất bản khoa học.'
                    : 'Evaluations focus on constructive guidance, methodological rigor, and academic publication readiness.'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Preferences & Language Setting Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            {locale === 'vi' ? 'Cài đặt hệ thống & Tùy chọn' : 'System Preferences & Settings'}
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px',
            background: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                {locale === 'vi' ? 'Ngôn ngữ hiển thị hệ thống' : 'System Display Language'}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                {locale === 'vi'
                  ? 'Cài đặt này sẽ được áp dụng thống nhất cho toàn bộ giao diện và công cụ thẩm định.'
                  : 'This preference will be applied across all dashboard views and review tools.'}
              </div>
            </div>
            
            {/* Embedded Language Switcher Dropdown */}
            <LanguageSwitcher variant="dropdown" />
          </div>
        </div>
      </div>
    </LecturerShell>
  );
}
