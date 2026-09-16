import { use } from 'react';
import { AdminSubmissionDetailView } from '@/features/admin';

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <AdminSubmissionDetailView id={id} />;
}
