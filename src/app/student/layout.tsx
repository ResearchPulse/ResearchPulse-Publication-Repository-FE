import { requireAreaAccess } from '../../lib/route-guards';

export const dynamic = 'force-dynamic';

export default async function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAreaAccess('student');
  return children;
}
