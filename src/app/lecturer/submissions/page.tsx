import { redirect } from 'next/navigation';
import { ROUTES } from '@/app/router';

export default function LecturerSubmissionsPage() {
  redirect(ROUTES.LECTURER.NEW_SUBMISSION);
}
