import type { ApiEnvelope, Preprint } from '@/shared/types';

const baseUrl = '/api/admin';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.replace(/^\/api\/v1\/admin/, '');
  const response = await fetch(baseUrl + normalizedPath, {
    ...options,
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({})) as ApiEnvelope<T>;
  if (!response.ok) throw new Error(body.message || 'Preprint API request failed');
  return body.data;
}

export const preprintApi = {
  list: (query = '') => request<{ items: Preprint[]; pagination: Record<string, number> }>(`/api/v1/admin/preprints${query}`),
  detail: (id: string) => request<Preprint>(`/api/v1/admin/preprints/${id}`),
  dashboard: () => request<Record<string, number>>('/api/v1/admin/dashboard'),
  assign: (id: string, reviewerUserId: string) => request<Preprint>(`/api/v1/admin/preprints/${id}/assign`, { method: 'POST', body: JSON.stringify({ reviewer_user_id: reviewerUserId }) }),
  review: (id: string, decision: string, comment: string) => request<Preprint>(`/api/v1/admin/preprints/${id}/review`, { method: 'POST', body: JSON.stringify({ decision, comment }) }),
  publish: (id: string) => request<Preprint>(`/api/v1/admin/preprints/${id}/publish`, { method: 'POST' }),
};

