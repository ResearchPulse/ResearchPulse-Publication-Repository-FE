export type Role = 'STUDENT' | 'LECTURER' | 'RESEARCHER' | 'ADMINISTRATOR';
export type PreprintStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_REVISION' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'WITHDRAWN' | 'ARCHIVED';
export type User = { id: string; email: string; name?: string; role?: Role };
export type Preprint = { id: string; title: string; abstract?: string; status: PreprintStatus; owner_user_id: string; owner_name?: string; supervisor_name?: string; current_version: number; updated_at: string; submitted_at?: string };
export type ApiEnvelope<T> = { success: boolean; data: T; message?: string; code?: string };
