import { redirect } from 'next/navigation';

export default function LegacySubmissionsPage() {
  redirect('/admin/submissions');
}
