'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StudentSidebarProps {
  revisionCount?: number;
  totalCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export function StudentSidebar({
  revisionCount = 1,
  totalCount = 3,
  isOpen = false,
  onClose,
}: StudentSidebarProps) {
  const pathname = usePathname();

  const isRouteActive = (href: string) => {
    if (href === '/student/dashboard') {
      return pathname === '/student/dashboard' || pathname === '/student';
    }
    if (href === '/student/mentor-feedback') {
      return pathname.startsWith('/student/mentor-feedback');
    }
    if (href === '/student/versions') {
      return pathname.startsWith('/student/versions');
    }
    if (href === '/student/profile') {
      return pathname.startsWith('/student/profile');
    }
    if (href === '/student/my-preprints/new') {
      return pathname === '/student/my-preprints/new';
    }
    if (href === '/student/my-preprints') {
      return (
        pathname === '/student/my-preprints' ||
        (pathname.startsWith('/student/my-preprints/') &&
          pathname !== '/student/my-preprints/new' &&
          !pathname.includes('/versions'))
      );
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
          <Link href="/" className="student-sidebar__logo-link" aria-label="Hyperdata Lab Home">
            <div className="student-sidebar__logo-lockup">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="32" height="32" rx="8" fill="#0071bc" />
                <rect x="7.5" y="11" width="3.5" height="11" rx="1.75" fill="#ffffff" />
                <rect x="14.25" y="6.5" width="3.5" height="19" rx="1.75" fill="#ffffff" />
                <rect x="21" y="10" width="3.5" height="13" rx="1.75" fill="#ffffff" />
              </svg>
              <div className="student-sidebar__brand-text-group">
                <span className="student-sidebar__brand-name">hyperlabdata</span>
                <span className="student-sidebar__brand-sub">Scholar Portal</span>
              </div>
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
        <nav className="student-sidebar__nav" aria-label="Scholar Dashboard Navigation">
          {/* Group: Core Workspace */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">WORKSPACE</span>

            <Link
              href="/student/dashboard"
              className={`student-sidebar__link ${isRouteActive('/student/dashboard') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="9" />
                  <rect x="14" y="3" width="7" height="5" />
                  <rect x="14" y="12" width="7" height="9" />
                  <rect x="3" y="16" width="7" height="5" />
                </svg>
              </span>
              <span className="student-sidebar__text">Dashboard</span>
            </Link>

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
              <span className="student-sidebar__text">My Manuscripts</span>
              {totalCount > 0 && (
                <span className="student-sidebar__badge">{totalCount}</span>
              )}
            </Link>

            <Link
              href="/student/my-preprints/new"
              className={`student-sidebar__link ${isRouteActive('/student/my-preprints/new') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </span>
              <span className="student-sidebar__text">New Submission</span>
            </Link>

            <Link
              href="/student/profile"
              className={`student-sidebar__link ${isRouteActive('/student/profile') ? 'student-sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="student-sidebar__text">Scholar Profile</span>
            </Link>
          </div>

          {/* Group: Mentorship & Quality */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">ACADEMIC REVIEW</span>

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
              <span className="student-sidebar__text">Mentor Feedback</span>
              {revisionCount > 0 && (
                <span className="student-sidebar__badge student-sidebar__badge--alert">
                  {revisionCount}
                </span>
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
              <span className="student-sidebar__text">Version Archive</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer: Student Profile Card */}
        <div className="student-sidebar__footer">
          <Link
            href="/student/profile"
            className="student-sidebar__profile-card"
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}
            onClick={onClose}
            title="View & Edit Scholar Profile"
          >
            <div className="student-sidebar__avatar">
              <span>NA</span>
              <span className="student-sidebar__status-dot" aria-label="Online" />
            </div>
            <div className="student-sidebar__profile-info">
              <span className="student-sidebar__name">Nguyen Minh An</span>
              <span className="student-sidebar__org">HCMUT • Author</span>
            </div>
          </Link>
          <Link
            href="/api/auth/logout"
            className="student-sidebar__logout-btn"
            title="Sign Out"
            aria-label="Sign Out"
            style={{ flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </Link>
        </div>
      </aside>
    </>
  );
}

export default StudentSidebar;
