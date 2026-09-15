import { redirect } from 'next/navigation';

export default async function LegacyPreprintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/student/my-preprints/${id}`);
}
