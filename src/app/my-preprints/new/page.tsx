import { redirect } from 'next/navigation';

export default function LegacyNewPreprintPage() {
  redirect('/student/my-preprints/new');
}
