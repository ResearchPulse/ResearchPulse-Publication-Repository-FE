import Link from 'next/link';
import { BrandMark } from '@hyperlabdata/ui';

export function UserShell({ children }: { children: React.ReactNode }) {
  return <div className="user-frame"><header className="user-header"><Link href="/student/my-preprints"><BrandMark /></Link><nav><Link href="/student/my-preprints">My preprints</Link><Link href="/student/my-preprints/new" className="header-cta">New submission</Link><Link href="/api/auth/logout">Sign out</Link></nav></header><main>{children}</main><footer className="user-footer">Hyperlabdata · A thoughtful home for student research.</footer></div>;
}
