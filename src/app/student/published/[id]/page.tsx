import { StudentPublishedDetailView } from '@/features/preprint';

export default async function PublishedPreprintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentPublishedDetailView id={id} />;
}
