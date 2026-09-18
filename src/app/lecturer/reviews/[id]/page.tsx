import { LecturerReviewDetailView } from '@/features/lecturer';

type PageProps = { params: Promise<{ id: string }> };

export default async function LecturerReviewDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <LecturerReviewDetailView publicationId={id} />;
}
