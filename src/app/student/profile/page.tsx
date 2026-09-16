import type { Metadata } from 'next';
import { StudentProfileView } from '../../../features/preprint';

export const metadata: Metadata = {
  title: 'Scholar Profile | Hyperdata Lab',
  description: 'Student author credentials, academic profile, research statement, and authored manuscripts.',
};

export default function StudentProfilePage() {
  return <StudentProfileView />;
}
