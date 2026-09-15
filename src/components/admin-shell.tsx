import Link from 'next/link';
import { BrandMark } from '@hyperlabdata/ui';

export function AdminSidebar({ active }: { active: string }) {
  return <aside className="admin-sidebar">
    <Link href="/admin/dashboard"><BrandMark /></Link>
    <div>
      <p className="sidebar-caption">Workspace</p>
      <nav className="side-nav" aria-label="Admin navigation">
        <Link href="/admin/dashboard" aria-current={active === 'dashboard' ? 'page' : undefined}><span className="nav-icon">01</span><span>Dashboard</span></Link>
        <Link href="/admin/submissions" aria-current={active === 'submissions' ? 'page' : undefined}><span className="nav-icon">02</span><span>Submissions</span></Link>
        <Link href="/admin/reviews" aria-current={active === 'reviews' ? 'page' : undefined}><span className="nav-icon">03</span><span>Reviews</span></Link>
      </nav>
    </div>
    <div className="sidebar-footer"><strong>Hyperlabdata</strong>Student research, reviewed with care.</div>
  </aside>;
}

export function Topbar({ title }: { title: string }) {
  return <header className="topbar"><div><div className="topbar-kicker">Hyperlabdata / Admin</div><h2 className="topbar-title">{title}</h2></div><div className="topbar-user"><span className="avatar">A</span><span>Administrator</span></div></header>;
}
