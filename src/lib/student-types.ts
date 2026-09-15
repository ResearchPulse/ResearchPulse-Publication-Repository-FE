export type PreprintStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'WITHDRAWN';

export type Preprint = {
  id: string;
  title: string;
  abstract: string;
  status: PreprintStatus;
  version?: number;
  currentVersion?: number;
  updatedAt: string;
  feedback?: string;
};

export type CurrentUser = { id: string; name: string; email: string; role?: string };
