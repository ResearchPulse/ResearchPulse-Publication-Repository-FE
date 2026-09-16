import { PreprintDetailView } from '@/features/preprint';

export default async function PreprintDetailPage({ params }: { params: Promise<{ id: string }> }) { return <PreprintDetailView id={(await params).id} />; }
