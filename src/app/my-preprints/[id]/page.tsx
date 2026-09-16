import { redirect } from 'next/navigation';

export default async function LegacyPreprintPage({ params }: { params: Promise<{ id: string }> }) { redirect('/student/my-preprints/' + (await params).id); }
