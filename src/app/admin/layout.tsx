import { requireAreaAccess } from '../../lib/route-guards';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAreaAccess('admin');
  return children;
}
