import { PreprintEditorView } from '@/features/preprint';

export default async function LecturerSubmissionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PreprintEditorView id={id} />;
}
