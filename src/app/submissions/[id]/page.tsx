import { redirect } from 'next/navigation';

export default async function LegacySubmissionPage({ params }: { params: Promise<{ id: string }> }) { redirect('/admin/submissions/' + (await params).id); }
