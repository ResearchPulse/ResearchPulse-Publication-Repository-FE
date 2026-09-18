import { requireAreaAccess } from '../../lib/route-guards';

export const dynamic = 'force-dynamic';

export default async function LecturerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAreaAccess('lecturer');
  return children;
}
