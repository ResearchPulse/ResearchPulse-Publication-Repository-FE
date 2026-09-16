import type { PreprintStatus } from '@/shared/types';

export type Author = {
  name: string;
  email: string;
  institution: string;
  isPrimary?: boolean;
  isCorresponding?: boolean;
};

export type ReviewDecision = 'NEEDS_REVISION' | 'APPROVED' | 'REJECTED';

export type ReviewNote = {
  id: string;
  reviewer_name: string;
  reviewer_title: string;
  decision: ReviewDecision;
  comments: string;
  recommendations?: string[];
  created_at: string;
};

export type TimelineEvent = {
  id: string;
  type: 'DRAFT_CREATED' | 'FILE_UPLOADED' | 'SUBMITTED' | 'ASSIGNED' | 'REVISION_REQUESTED' | 'APPROVED' | 'PUBLISHED';
  title: string;
  description: string;
  actor: string;
  timestamp: string;
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
};

export type StudentPreprint = {
  id: string;
  title: string;
  abstract?: string;
  discipline: string;
  keywords: string[];
  status: PreprintStatus;
  current_version: number;
  authors: Author[];
  supervisor?: string;
  file_name?: string;
  file_size?: string;
  sha256?: string;
  doi?: string;
  updated_at: string;
  submitted_at?: string;
  reviews?: ReviewNote[];
  timeline?: TimelineEvent[];
  versions?: PreprintVersionInfo[];
};

export type ApiPending = { code: 'API_NOT_AVAILABLE'; message: string };
