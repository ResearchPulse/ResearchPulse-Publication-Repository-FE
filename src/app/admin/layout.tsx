import { requireAreaAccess } from '../../lib/route-guards';

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAreaAccess('admin');
  return children;
}
