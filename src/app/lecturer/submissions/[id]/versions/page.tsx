import { PreprintVersionsView } from '@/features/preprint';

export default async function LecturerPreprintVersionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PreprintVersionsView id={id} />;
}
