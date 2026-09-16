import Link from 'next/link';
import type { ReactNode } from 'react';
import { HyperdataLogo } from '@/components/hyperdata-logo';

interface StudentShellProps {
  title: string;
  kicker?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: ReactNode;
}

export function StudentShell({
  title,
  kicker = 'Student Scholar Portal',
  actions,
  breadcrumbs = [{ label: 'Preprint Portal', href: '/' }, { label: 'My Manuscripts' }],
  children,
}: StudentShellProps) {
  return (
    <div className="student-frame">
      {/* Top Header */}
      <header className="student-header">
        <div className="student-header__container">
          <div className="student-header__left">
            <Link href="/" className="student-brand" aria-label="Hyperdata Lab Home">
              <HyperdataLogo size={30} />
            </Link>
            <div className="student-brand__divider" aria-hidden="true" />
            <Link href="/student/my-preprints" className="student-brand__portal">
              <span>Preprint Portal</span>
              <span className="student-badge student-badge--scholar">
                <span className="student-badge__dot" />
                Student Scholar
              </span>
            </Link>
          </div>

          <nav className="student-nav" aria-label="Student Navigation">
            <Link href="/student/my-preprints" className="student-nav__link student-nav__link--active">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>My Manuscripts</span>
            </Link>
            <Link href="/student/my-preprints/new" className="student-nav__link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Submission</span>
            </Link>
            <Link href="/" className="student-nav__link student-nav__link--muted">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <span>Public Directory</span>
            </Link>
          </nav>

          <div className="student-header__right">
            <div className="student-profile-pill">
              <div className="student-avatar" aria-hidden="true">NA</div>
              <div className="student-profile-info">
                <span className="student-profile-name">Nguyen Minh An</span>
                <span className="student-profile-inst">HCMUT • Author</span>
              </div>
            </div>
            <Link href="/api/auth/logout" className="student-signout" title="Sign out of student account">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Sign out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main id="main-content" className="student-main">
        <div className="student-container">
          {/* Breadcrumb strip */}
          <nav className="student-breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.label} className="student-breadcrumb-item">
                {idx > 0 && <span className="student-breadcrumb-separator">/</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="student-breadcrumb-link">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="student-breadcrumb-current">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* View Header */}
          <div className="student-view-header">
            <div>
              <span className="student-kicker">{kicker}</span>
              <h1 className="student-page-title">{title}</h1>
            </div>
            {actions && <div className="student-view-actions">{actions}</div>}
          </div>

          {/* Children View Content */}
          <div className="student-content">{children}</div>
        </div>
      </main>
    </div>
  );
}

export default StudentShell;
