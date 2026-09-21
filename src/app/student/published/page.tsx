import { Metadata } from 'next';
import { StudentPublishedView } from '@/features/preprint/views';

export const metadata: Metadata = {
  title: 'Kho bài báo | HyperData Lab',
  description: 'Khám phá các bài báo và công trình nghiên cứu đã được xuất bản.',
};

export default function StudentPublishedPage() {
  return <StudentPublishedView />;
}
