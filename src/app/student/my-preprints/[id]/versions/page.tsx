import { PreprintVersionsView } from '@/features/preprint';

export default async function PreprintVersionsPage({ params }: { params: Promise<{ id: string }> }) { return <PreprintVersionsView id={(await params).id} />; }
