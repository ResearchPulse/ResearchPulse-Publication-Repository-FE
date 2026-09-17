import Link from 'next/link';
import type { ReactNode } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { BrandMark, PageHeader } from '@hyperdata/design-system';
import { ROUTES } from '@/app/router';

export type AdminNavKey = 'dashboard' | 'submissions' | 'reviews';

const navItems: Array<{ key: AdminNavKey; label: string; href: string }> = [
  { key: 'dashboard', label: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD },
  { key: 'submissions', label: 'Submissions', href: ROUTES.ADMIN.SUBMISSIONS },
  { key: 'reviews', label: 'Reviews', href: ROUTES.ADMIN.REVIEWS },
];

function NavGlyph({ type }: { type: AdminNavKey }) {
  if (type === 'dashboard') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></svg>;
  }

  if (type === 'submissions') {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6 3.75h8.5L19 8.25v12H6a2 2 0 0 1-2-2v-12.5a2 2 0 0 1 2-2Z" /><path d="M14 3.75v5h5M8 13h8M8 16.5h6" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 5.5h16v13H4z" /><path d="m7.5 9 2.5 2.5L7.5 14M12.5 14H17" /></svg>;
}

export function AdminSidebar({ active }: { active: AdminNavKey }) {
  return (
    <aside className="admin-sidebar">
      <Link className="admin-sidebar__brand" href={ROUTES.ADMIN.DASHBOARD} aria-label="Go to admin dashboard"><BrandMark /></Link>
      <div className="admin-sidebar__nav-group">
        <p className="sidebar-caption">Workspace</p>
        <nav className="side-nav" aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href} aria-current={active === item.key ? 'page' : undefined}>
              <span className="nav-icon"><NavGlyph type={item.key} /></span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className="sidebar-footer"><strong>ResearchPulse</strong><span>Student research, reviewed with care.</span></div>
    </aside>
  );
}

export function Topbar({ title }: { title: string }) {
  const { user } = useAuth();
  const initials = user?.name ? user.name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'A';
  const displayName = user?.name || user?.email || 'Administrator';
  return (
    <header className="topbar">
      <div>
        <div className="topbar-kicker">ResearchPulse / Admin</div>
        <h2 className="topbar-title">{title}</h2>
      </div>
      <div className="topbar-user">
        <span className="avatar" aria-hidden="true">A</span>
        <span>Administrator</span>
      </div>
    </header>
  );
}

export function AdminPageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />;
}

export function AdminShell({ active, title, children }: { active: AdminNavKey; title: string; children: ReactNode }) {
  return (
    <div className="admin-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <AdminSidebar active={active} />
      <main className="admin-main" id="main-content">
        <Topbar title={title} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
