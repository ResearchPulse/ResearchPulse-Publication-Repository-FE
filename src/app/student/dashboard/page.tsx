import type { Metadata } from 'next';
import { StudentDashboardView } from '../../../features/preprint';

export const metadata: Metadata = {
  title: 'Research Dashboard | Hyperdata Lab',
  description: 'Student research workspace and preprint mentorship dashboard',
};

export default function StudentDashboardPage() {
  return <StudentDashboardView />;
}
