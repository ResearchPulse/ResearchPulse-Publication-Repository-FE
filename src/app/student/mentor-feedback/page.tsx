import type { Metadata } from 'next';
import { StudentMentorFeedbackView } from '../../../features/preprint';

export const metadata: Metadata = {
  title: 'Mentor Feedback & Reviews | Hyperdata Lab',
  description: 'Faculty mentor reviews and revision checklists for student manuscripts',
};

export default function StudentMentorFeedbackPage() {
  return <StudentMentorFeedbackView />;
}
