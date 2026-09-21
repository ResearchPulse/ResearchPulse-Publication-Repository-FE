import type { PreprintStatus } from '@/shared/types';

export type Author = {
  name: string;
  email: string;
  studentId?: string;
  role?: 'STUDENT' | 'LECTURER' | 'ADMIN';
  userId?: string;
  verificationStatus?: 'VERIFIED' | 'UNREGISTERED' | 'MISSING_IDENTIFIER' | 'INACTIVE';
  verificationReason?: string;
  institution: string;
  isPrimary?: boolean;
  isCorresponding?: boolean;
};

export type ReviewDecision = 'PENDING' | 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED';

export type ReviewNote = {
  id: string;
  reviewer_name: string;
  reviewer_title: string;
  decision: ReviewDecision;
  comments: string;
  recommendations?: string[];
  created_at: string;
  round?: number;
  assignmentRole?: 'PRIMARY' | 'SECONDARY' | 'LEGACY';
};

export type TimelineEvent = {
  id: string;
  type: 'DRAFT_CREATED' | 'FILE_UPLOADED' | 'SUBMITTED' | 'ASSIGNED' | 'REVISION_REQUESTED' | 'REVIEW_SUBMITTED' | 'REJECTED' | 'REOPENED' | 'APPROVED' | 'PUBLISHED';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
  version?: string | null;
};

export type PreprintVersionInfo = {
  version: number;
  version_label: string;
  created_at: string;
  change_summary?: string;
  file_name: string;
  file_size: string;
  sha256?: string;
  status: PreprintStatus;
  is_current?: boolean;
  submitted_at?: string;
  download_url?: string;
  authors?: Author[];
};

export type StudentPreprint = {
  id: string;
  title: string;
  titleNeedsInput?: boolean;
  abstract?: string;
  discipline: string;
  keywords: string[];
  status: PreprintStatus;
  audiences?: Array<'GUEST' | 'STUDENT' | 'LECTURER'>;
  is_private?: boolean;
  current_version: number;
  revision_required?: boolean;
  change_summary?: string;
  authors: Author[];
  supervisor?: string;
  file_name?: string;
  file_size?: string;
  sha256?: string;
  download_url?: string;
  doi?: string;
  updated_at: string;
  submitted_at?: string;
  reviews?: ReviewNote[];
  timeline?: TimelineEvent[];
  versions?: PreprintVersionInfo[];
};

export type AuthorVerificationStatus = Author['verificationStatus'];

export type PreprintAnalysis = {
  title?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationDate?: string | null;
  keywords: string[];
  authors: Array<Author & {
    verification?: {
      status: NonNullable<AuthorVerificationStatus>;
      reason?: string;
      user?: { id: string; name: string | null; email: string; studentId: string | null; role: 'STUDENT' | 'LECTURER' | 'ADMIN' };
    };
  }>;
};

export type ApiPending = { code: 'API_NOT_AVAILABLE'; message: string };
