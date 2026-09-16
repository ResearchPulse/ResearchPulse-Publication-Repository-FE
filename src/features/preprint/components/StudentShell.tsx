import Link from 'next/link';
import type { ReactNode } from 'react';
import { HyperdataLogo } from '@/components/hyperdata-logo';

interface StudentShellProps {
  title?: string;
  kicker?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  showStandardHeader?: boolean;
  children: ReactNode;
}

export function StudentShell({
  title,
  kicker,
  actions,
  breadcrumbs,
  showStandardHeader = true,
  children,
}: StudentShellProps) {
  return (
    <div className="student-frame">
      {/* Top Header matching user screenshot */}
      <header className="student-header">
        <div className="student-header__container">
          <div className="student-header__left">
            <Link href="/" className="student-brand" aria-label="Hyperdata Lab Home">
              <div className="student-brand__lockup">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect width="32" height="32" rx="8" fill="#0071bc" />
                  <rect x="7.5" y="11" width="3.5" height="11" rx="1.75" fill="#ffffff" />
                  <rect x="14.25" y="6.5" width="3.5" height="19" rx="1.75" fill="#ffffff" />
                  <rect x="21" y="10" width="3.5" height="13" rx="1.75" fill="#ffffff" />
                </svg>
                <span className="student-brand__text">hyperlabdata</span>
              </div>
            </Link>
          </div>

          <nav className="student-nav" aria-label="Student Navigation">
            <Link href="/student/my-preprints" className="student-nav__link student-nav__link--text">
              My preprints
            </Link>
            <Link href="/student/my-preprints/new" className="student-nav__cta">
              New submission
            </Link>
            <Link href="/api/auth/logout" className="student-nav__link student-nav__link--signout">
              Sign out
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main id="main-content" className="student-main">
        <div className="student-container">
          {/* Breadcrumbs if provided */}
          {breadcrumbs && breadcrumbs.length > 0 && (
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
          )}

          {/* Standard Page Title Header if enabled */}
          {showStandardHeader && title && (
            <div className="student-view-header">
              <div>
                {kicker && <span className="student-kicker">{kicker}</span>}
                <h1 className="student-page-title">{title}</h1>
              </div>
              {actions && <div className="student-view-actions">{actions}</div>}
            </div>
          )}

          {/* Children View Content */}
          <div className="student-content">{children}</div>
        </div>
      </main>

      {/* Footer matching user screenshot */}
      <footer className="student-footer">
        <div className="student-container">
          <span>Hyperlabdata · A thoughtful home for student research.</span>
        </div>
      </footer>
    </div>
  );
}

export default StudentShell;
