import { PreprintEditorView } from '@/features/preprint';

export default async function EditPreprintPage({ params }: { params: Promise<{ id: string }> }) { return <PreprintEditorView id={(await params).id} />; }
