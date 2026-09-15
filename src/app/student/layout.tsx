import { requireAreaAccess } from '../../lib/route-guards';

export default async function StudentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAreaAccess('student');
  return children;
}
