'use client';

import Link from 'next/link';
import Image from 'next/image';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/api/authApi';

interface StudentSidebarProps {
  revisionCount?: number;
  totalCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function StudentSidebar({
  revisionCount = 0,
  totalCount = 0,
  isOpen = false,
  onClose,
}: StudentSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user?.name?.trim() || user?.email?.split('@')[0] || 'Student';
  const displayOrg = user?.email || '';

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
    return 'ST';
  };

  const initials = getInitials(user?.name, user?.email);

  const isRouteActive = (href: string) => {
    if (href === '/student/my-preprints') {
      return (
        pathname === '/student/my-preprints' ||
        pathname === '/student' ||
        pathname === '/student/dashboard' ||
        (pathname.startsWith('/student/my-preprints/') &&
          pathname !== '/student/my-preprints/new' &&
          !pathname.includes('/versions'))
      );
    }
    if (href === '/student/mentor-feedback') {
      return pathname.startsWith('/student/mentor-feedback');
    }
    if (href === '/student/versions') {
      return pathname.startsWith('/student/versions');
    }
    if (href === '/student/account') {
      return pathname.startsWith('/student/account');
    }
    if (href === '/student/my-preprints/new') {
      return pathname === '/student/my-preprints/new';
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="student-sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`student-sidebar ${isOpen ? 'student-sidebar--open' : ''}`}>
        {/* Brand Header */}
        <div className="student-sidebar__brand">
          <Link href="/student/my-preprints" className="student-sidebar__logo-link" aria-label="Hyperdata Lab Home">
            <div className="student-sidebar__logo-lockup">
              <Image
                src="/hyperdata-lab-logo.png"
                alt="Hyperdata Lab Logo"
                width={28}
                height={28}
                style={{ borderRadius: '6px', objectFit: 'contain' }}
                priority
              />
              <span className="student-sidebar__brand-name">Hyperdata Lab</span>
            </div>
          </Link>

          {onClose && (
            <button
              type="button"
              className="student-sidebar__close-btn"
              onClick={onClose}
              aria-label="Close Sidebar"
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="student-sidebar__nav" aria-label="Thanh điều hướng học thuật">
          {/* Group: Manuscripts */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">BẢN THẢO</span>

            <Link
              href="/student/my-preprints"
              className={`student-sidebar__link ${isRouteActive('/student/my-preprints') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <span className="student-sidebar__text">Bản thảo của tôi</span>
              {totalCount > 0 && (
                <span className="student-sidebar__badge">{totalCount}</span>
              )}
            </Link>

            <Link
              href="/student/versions"
              className={`student-sidebar__link ${isRouteActive('/student/versions') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span className="student-sidebar__text">Lịch sử phiên bản</span>
            </Link>
          </div>

          {/* Group: Review & Mentorship */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">THẨM ĐỊNH</span>

            <Link
              href="/student/mentor-feedback"
              className={`student-sidebar__link ${isRouteActive('/student/mentor-feedback') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon student-sidebar__icon--amber">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </span>
              <span className="student-sidebar__text">Nhận xét</span>
              {revisionCount > 0 && (
                <span className="student-sidebar__badge student-sidebar__badge--alert">
                  {revisionCount}
                </span>
              )}
            </Link>
          </div>

          {/* Group: Account */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">CÁ NHÂN</span>

            <Link
              href="/student/account"
              className={`student-sidebar__link ${isRouteActive('/student/account') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="student-sidebar__text">Tài khoản</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer: Student Profile Card */}
        <div className="student-sidebar__footer">
          <div className="student-sidebar__profile-card">
            <div className="student-sidebar__avatar">
              <span>{initials}</span>
              <span className="student-sidebar__status-dot" aria-label="Trực tuyến" />
            </div>
            <div className="student-sidebar__profile-info">

              <span className="student-sidebar__name" title={displayName}>
                {displayName}
              </span>
              {displayOrg && (
                <span className="student-sidebar__org" title={displayOrg}>
                  {displayOrg}
                </span>
              )}

            </div>
            <button
              type="button"
              onClick={() => authApi.logout()}
              className="student-sidebar__logout-btn"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default StudentSidebar;

