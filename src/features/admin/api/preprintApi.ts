import type { ApiEnvelope } from '@/shared/types';

const baseUrl = '/api/admin';

export type AdminPublicationStatus = 'PROCESSING' | 'DRAFTING' | 'REVIEWING' | 'PUBLISHED' | 'REJECTED';
export type AdminDecisionStatus = 'PUBLISHED' | 'REJECTED' | 'DRAFTING';
export type AdminPublicationAudience = 'GUEST' | 'STUDENT' | 'LECTURER';

export type AdminUser = {
  id: string;
  email: string;
  name?: string | null;
  studentId?: string | null;
  major?: string | null;
  avatarUrl?: string | null;
  role: 'ADMIN' | 'LECTURER' | 'STUDENT';
  isActive: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  mustChangePassword?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  attemptNumber?: number;
  rejectionHistory?: Array<{
    id: string;
    studentId?: string | null;
    name?: string | null;
    major?: string | null;
    attemptNumber: number;
    rejectedAt: string;
  }>;
};

export type AdminPublication = {
  id: string;
  title?: string | null;
  abstract?: string | null;
  doi?: string | null;
  publicationDate?: string | null;
  keywords: string[];
  objectKey?: string;
  fileSize?: number | null;
  downloadUrl?: string | null;
  status: AdminPublicationStatus;
  reviewRound?: number;
  audiences: AdminPublicationAudience[];
  isPrivate: boolean;
  uploader?: {
    id: string;
    name?: string | null;
    email: string;
    role?: 'ADMIN' | 'LECTURER' | 'STUDENT' | string;
    studentId?: string | null;
  };
  authors?: Array<{
    id?: string;
    name: string;
    email?: string | null;
    affiliation?: string | null;
    orderIndex?: number;
  }>;
  currentVersion?: {
    id: string;
    version: number;
    versionLabel: string;
    fileName: string;
    submittedAt?: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminReview = {
  id: string;
  publicationId: string;
  reviewerId: string;
  versionId: string;
  round: number;
  comment?: string | null;
  recommendation?: 'PUBLISH' | 'NEEDS_REVISION' | 'REJECT' | null;
  assignmentRole?: 'PRIMARY' | 'SECONDARY' | 'LEGACY';
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  reviewer?: { id: string; name?: string | null; email: string };
  publication?: {
    id: string;
    title?: string | null;
    status: AdminPublicationStatus;
    currentVersionLabel?: string;
    uploader?: {
      id: string;
      name?: string | null;
      email: string;
      role?: 'ADMIN' | 'LECTURER' | 'STUDENT' | string;
      studentId?: string | null;
    };
  };
};

export type AdminVersion = {
  id: string;
  publicationId: string;
  version: number;
  versionLabel: string;
  title?: string | null;
  fileName: string;
  fileSize?: number | null;
  sha256?: string | null;
  changeSummary?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  status: AdminPublicationStatus;
  isCurrent: boolean;
  downloadUrl?: string | null;
};

export type AdminTimelineEvent = {
  id: string;
  type: string;
  title: string;
  description: string;
  actor: string;
  actorId?: string | null;
  version?: string | null;
  timestamp: string;
};

export type AdminPagination = { page: number; limit: number; total: number; totalPages: number };
export type AdminUsersResponse = { users: AdminUser[]; pagination: AdminPagination };

export type AdminOverview = {
  metrics: {
    submitted: number;
    underReview: number;
    needsRevision: number;
    published: number;
    rejected: number;
    processing: number;
    facultySubmissions?: number;
    studentSubmissions?: number;
    total: number;
  };
  byStatus: Record<string, number>;
  users: {
    total: number;
    lecturers: number;
    students: number;
  };
  priorityQueue: Array<{
    id: string;
    title: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    uploader?: {
      id: string;
      name?: string | null;
      email: string;
      role?: 'ADMIN' | 'LECTURER' | 'STUDENT' | string;
      studentId?: string | null;
    };
  }>;
};

type ApiResponse<T> = ApiEnvelope<T> & {
  pagination?: AdminPagination;
  user?: AdminUser;
  error?: { message?: string };
};

async function requestResponse<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const normalizedPath = path
    .replace(/^\/api\/v1\/admin/, '')
    .replace(/^\/api\/v1\/publications/, '/publications');
  const response = await fetch(baseUrl + normalizedPath, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({})) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(body.error?.message || body.message || 'Preprint API request failed');
  }
  return body;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const body = await requestResponse<T>(path, options);
  return body.data as T;
}

function queryString(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value));
  });
  const result = query.toString();
  return result ? `?${result}` : '';
}

export const preprintApi = {
  overview: () => request<AdminOverview>('/api/v1/admin/overview'),
  listSubmissions: (params: { page?: number; limit?: number; status?: AdminPublicationStatus; search?: string; uploaderRole?: 'LECTURER' | 'STUDENT' } = {}) =>
    requestResponse<AdminPublication[]>(`/api/v1/publications${queryString(params)}`).then((body) => ({
      items: body.data || [],
      pagination: body.pagination || { page: params.page || 1, limit: params.limit || 20, total: 0, totalPages: 1 },
    })),
  getSubmission: (id: string) => request<AdminPublication>(`/api/v1/publications/${id}`),
  listAllReviews: (params: { page?: number; limit?: number; recommendation?: string; search?: string } = {}) =>
    requestResponse<AdminReview[]>(`/api/v1/admin/reviews${queryString(params)}`).then((body) => ({
      items: body.data || [],
      pagination: body.pagination || { page: params.page || 1, limit: params.limit || 20, total: (body.data || []).length, totalPages: 1 },
    })),
  getReviews: (id: string, round?: 'current' | 'all' | number) =>
    request<AdminReview[]>(`/api/v1/publications/${id}/reviews${round ? `?round=${round}` : ''}`),
  getVersions: (id: string) => request<AdminVersion[]>(`/api/v1/publications/${id}/versions`),
  getTimeline: (id: string) => request<AdminTimelineEvent[]>(`/api/v1/publications/${id}/timeline`),
  listLecturers: () => request<AdminUsersResponse>('/api/v1/admin/users?role=LECTURER&isActive=true&limit=100'),
  assignReviewers: (id: string, primaryReviewerId: string, secondaryReviewerIds: string[]) => request<AdminReview[]>(`/api/v1/publications/${id}/reviews/assign`, {
    method: 'POST',
    body: JSON.stringify({ primaryReviewerId, secondaryReviewerIds }),
  }),
  changeStatus: (id: string, status: AdminDecisionStatus, reason: string) => request<Pick<AdminPublication, 'id' | 'title' | 'status' | 'updatedAt'>>(`/api/v1/publications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  }),
  updateVisibility: (id: string, audiences: AdminPublicationAudience[]) => request<Pick<AdminPublication, 'id' | 'status' | 'audiences' | 'isPrivate' | 'updatedAt'>>(`/api/v1/publications/${id}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ audiences }),
  }),
  listUsers: (params: { page?: number; limit?: number; role?: AdminUser['role']; search?: string; isActive?: boolean } = {}) =>
    request<AdminUsersResponse>(`/api/v1/admin/users${queryString(params)}`),
  getUser: (id: string) => request<AdminUser>(`/api/v1/admin/users/${id}`),
  createUser: (input: { email: string; name?: string | null; username?: string | null; studentId?: string | null; major?: string | null; password?: string; role?: AdminUser['role'] }) =>
    request<AdminUser>('/api/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateUser: (id: string, input: Partial<{ email: string; name: string | null; username: string | null; studentId: string | null; major: string | null; role: AdminUser['role']; password: string }>) =>
    request<AdminUser>(`/api/v1/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteUser: (id: string) => request<AdminUser>(`/api/v1/admin/users/${id}`, {
    method: 'DELETE',
  }),
  updateUserRole: (id: string, role: AdminUser['role']) => requestResponse<never>(`/api/v1/admin/users/${id}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }).then((body) => body.user as AdminUser),
  updateUserStatus: (id: string, isActive: boolean) => requestResponse<never>(`/api/v1/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  }).then((body) => body.user as AdminUser),
  listPendingUsers: (params: { page?: number; limit?: number } = {}) =>
    request<{ users: AdminUser[]; pagination: AdminPagination }>(`/api/v1/admin/pending-users${queryString(params)}`),
  approveUser: (id: string) => requestResponse<never>(`/api/v1/admin/users/${id}/approve`, { method: 'POST' }).then((body) => body.user as AdminUser),
  rejectUser: (id: string) => requestResponse<never>(`/api/v1/admin/users/${id}/reject`, { method: 'POST' }).then((body) => body.user as AdminUser),
};

export const adminApi = preprintApi;
