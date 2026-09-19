'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';
import { ROUTES } from '@/app/router';
import { useAuth } from '@/features/auth/hooks/useAuth';

export type LecturerNavKey = 'reviews' | 'submissions' | 'profile';

export interface LecturerShellProps {
  active: LecturerNavKey;
  title: string;
  pendingCount?: number;
  children: ReactNode;
}

export function LecturerShell({ active, title, pendingCount, children }: LecturerShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const displayName = authLoading
    ? 'Loading profile…'
    : user?.name?.trim() || user?.email?.split('@')[0] || 'Lecturer account';
  const displayRole = authLoading ? 'Loading account…' : user?.email || 'Lecturer account';

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
    return 'LR';
  };

  const initials = authLoading ? '…' : getInitials(user?.name, user?.email);

  return (
    <div className="lecturer-frame">
      <a className="lecturer-skip-link" href="#lecturer-main">Skip to content</a>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="student-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Unified Student-Style Sidebar with Mobile Off-canvas Drawer */}
      <aside className={`student-sidebar ${sidebarOpen ? 'student-sidebar--open' : ''}`}>
        {/* Brand Header */}
        <div className="student-sidebar__brand">
          <Link href={ROUTES.LECTURER.REVIEWS} className="student-sidebar__logo-link" aria-label="Hyperdata Lab Home">
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

          {/* Close button on mobile */}
          <button
            type="button"
            className="student-sidebar__close-btn"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
          >
            ×
          </button>
        </div>

        {/* Navigation Group */}
        <nav className="student-sidebar__nav" aria-label="Lecturer navigation">
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">WORKSPACE</span>
            <Link
              href={ROUTES.LECTURER.SUBMISSIONS}
              className={`student-sidebar__link ${active === 'submissions' ? 'student-sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
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
            </Link>
          </div>

          {/* Group: Peer Review */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">PEER REVIEW</span>
            <Link
              href={ROUTES.LECTURER.REVIEWS}
              className={`student-sidebar__link ${active === 'reviews' ? 'student-sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  <path d="m9 9 2 2 4-4" />
                </svg>
              </span>
              <span className="student-sidebar__text">Review queue</span>
              {pendingCount !== undefined && pendingCount > 0 && (
                <span style={{ marginLeft: 'auto', fontSize: '12.5px', fontWeight: 700, color: '#0071bc' }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          </div>

          {/* Group: Profile */}
          <div className="student-sidebar__group">
            <span className="student-sidebar__group-title">PROFILE</span>
            <Link
              href={ROUTES.LECTURER.PROFILE}
              className={`student-sidebar__link ${active === 'profile' ? 'student-sidebar__link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="student-sidebar__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span className="student-sidebar__text">Profile</span>
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer with Profile Card */}
        <div className="student-sidebar__footer">
          {/* User Profile Card */}
          <div className="student-sidebar__profile-card">
            <div className="student-sidebar__avatar">
              <span>{initials}</span>
              <span className="student-sidebar__status-dot" aria-label="Online" />
            </div>
            <div className="student-sidebar__profile-info">
              <span className="student-sidebar__name" title={displayName}>
                {displayName}
              </span>
              <span className="student-sidebar__org" title={displayRole}>
                {displayRole}
              </span>
            </div>
            <Link
              href="/api/auth/logout"
              className="student-sidebar__logout-btn"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="lecturer-main" id="lecturer-main">
        <header className="student-topbar">
          <div className="student-topbar__left">
            {/* Hamburger Button on Mobile */}
            <button
              type="button"
              className="student-topbar__menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Sidebar Navigation"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <div className="student-topbar__breadcrumbs">
              <span className="student-topbar__crumb-root">
                {active === 'submissions' ? 'Faculty Workspace' : 'Reviewer Workspace'}
              </span>
              <span className="student-topbar__crumb-sep">/</span>
              <span className="student-topbar__crumb-current">{title}</span>
            </div>
          </div>

          <div className="student-topbar__right">
            <div className="student-topbar__search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search manuscripts, DOIs, reviews..." className="student-topbar__search-input" aria-label="Search manuscripts" />
            </div>

            <div className="student-topbar__notif-wrapper">
              <button
                type="button"
                className="student-topbar__notif-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label={`Notifications (${pendingCount || 0} active review alerts)`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {pendingCount !== undefined && pendingCount > 0 && <span className="student-topbar__notif-dot" />}
              </button>

              {showNotifications && (
                <div className="student-topbar__notif-popover">
                  <div className="student-topbar__notif-header">
                    <strong>Academic Review Alerts</strong>
                    {pendingCount !== undefined && pendingCount > 0 && (
                      <span className="student-topbar__notif-count">{pendingCount}</span>
                    )}
                  </div>
                  <div className="student-topbar__notif-list">
                    {pendingCount !== undefined && pendingCount > 0 ? (
                      <Link href={ROUTES.LECTURER.REVIEWS} className="student-topbar__notif-item" onClick={() => setShowNotifications(false)}>
                        <div className="student-topbar__notif-item-icon student-topbar__notif-item-icon--amber">!</div>
                        <div className="student-topbar__notif-item-text">
                          <p className="student-topbar__notif-item-title">{pendingCount} manuscript(s) awaiting review</p>
                          <p className="student-topbar__notif-item-desc">Open the Review Queue to submit your evaluation and decisions.</p>
                        </div>
                      </Link>
                    ) : (
                      <p className="student-topbar__notif-item-desc">No pending review tasks in your queue.</p>
                    )}
                  </div>
                  <div className="student-topbar__notif-footer">
                    <Link href={ROUTES.LECTURER.REVIEWS} onClick={() => setShowNotifications(false)}>View review queue →</Link>
                  </div>
                </div>
              )}
            </div>

            <Link href={ROUTES.LECTURER.NEW_SUBMISSION} className="student-topbar__cta">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>New Submission</span>
            </Link>
          </div>
        </header>
        <div className="lecturer-content">{children}</div>
      </main>
    </div>
  );
}
