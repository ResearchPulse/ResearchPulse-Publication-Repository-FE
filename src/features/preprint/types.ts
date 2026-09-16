import type { PreprintStatus } from '@/shared/types';

export type StudentPreprint = {
  id: string;
  title: string;
  abstract?: string;
  status: PreprintStatus;
  current_version: number;
  updated_at: string;
  submitted_at?: string;
};

export type ApiPending = { code: 'API_NOT_AVAILABLE'; message: string };
