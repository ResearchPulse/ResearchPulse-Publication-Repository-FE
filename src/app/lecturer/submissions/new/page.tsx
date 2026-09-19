import { PreprintEditorView } from '@/features/preprint';

interface NewLecturerSubmissionPageProps {
  searchParams: Promise<{ id?: string | string[] }>;
}

export default async function NewLecturerSubmissionPage({ searchParams }: NewLecturerSubmissionPageProps) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : undefined;

  return <PreprintEditorView id={id} />;
}
