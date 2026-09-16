import type { Metadata } from 'next';
import { StudentVersionArchiveView } from '../../../features/preprint';

export const metadata: Metadata = {
  title: 'Permanent Version Archive | Hyperdata Lab',
  description: 'Immutable version lineage and cryptographic SHA-256 timestamps for student manuscripts',
};

export default function StudentVersionsPage() {
  return <StudentVersionArchiveView />;
}
