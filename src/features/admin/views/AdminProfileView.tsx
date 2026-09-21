'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { AdminShell } from '../components/AdminShell';
import { LanguageSwitcher, useTranslation } from '@/i18n';

export function AdminProfileView() {
  const [copiedId, setCopiedId] = useState(false);
  const { locale } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Administrator';
  const displayEmail = user?.email || 'admin@hyperdata.org';

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
    return 'AD';
  };

  const initials = getInitials(user?.name, user?.email);

  const handleCopyId = () => {
    if (!user?.id) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <AdminShell active="profile" title="Profile">
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Card 1: Header Profile Card */}
        <div className="admin-profile-card">
          <div
            className="admin-profile-card-inner"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div className="admin-profile-avatar-wrapper">
                <div
                  className="admin-profile-avatar-content"
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0071bc 0%, #0284c7 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 800,
                    flexShrink: 0,
                    position: 'relative',
                    boxShadow: '0 4px 14px rgba(0, 113, 188, 0.25)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {initials}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#22c55e',
                      border: '2.5px solid #ffffff',
                      boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.2)',
                    }}
                    aria-label="Online"
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {displayName}
                  </h1>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      background: '#e0f2fe',
                      color: '#0071bc',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      border: '1px solid #bae6fd',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    System Administrator
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '13.5px', color: '#64748b' }}>
                  System Administrator · Hyperdata Lab
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#0071bc', fontWeight: 500 }}>
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Account Credentials */}
        <div className="admin-profile-card">
          <div
            className="admin-profile-card-inner"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Account Credentials
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13.5px' }}>
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  Full Name
                </span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>{displayName}</strong>
              </div>

              <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  Email Address
                </span>
                <span style={{ color: '#1e293b', fontSize: '14px' }}>{displayEmail}</span>
              </div>

              <div style={{ paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                  Account Role
                </span>
                <span style={{ color: '#0071bc', fontWeight: 600, fontSize: '14px' }}>
                  {user?.role === 'ADMIN' ? 'System Administrator (ADMIN)' : 'Administrator'}
                </span>
              </div>
              
              <div>
                <span style={{ display: 'block', fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                  User ID
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontSize: '12.5px', color: '#334155', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}>
                    {user?.id ? user.id : 'N/A'}
                  </code>
                  {user?.id && (
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="admin-profile-copy-btn"
                      title={copiedId ? 'Đã sao chép!' : 'Sao chép User ID'}
                    >
                      {copiedId ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '11px' }}>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          <span style={{ fontSize: '11px' }}>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: System Preferences & Language Setting Card */}
        <div className="admin-profile-card">
          <div
            className="admin-profile-card-inner"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0071bc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {locale === 'vi' ? 'Cài đặt hệ thống & Tùy chọn' : 'System Preferences & Settings'}
            </h2>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                gap: '16px',
                flexWrap: 'wrap',
                transition: 'all 0.2s ease',
              }}
            >
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
                    ? 'Cài đặt này sẽ được áp dụng thống nhất cho toàn bộ giao diện và các trang quản trị.'
                    : 'This preference will be applied across all dashboard views and management pages.'}
                </div>
              </div>
              
              {/* Embedded Language Switcher Dropdown */}
              <LanguageSwitcher variant="dropdown" />
            </div>
          </div>
        </div>

      </div>
    </AdminShell>
  );
}

export default AdminProfileView;
