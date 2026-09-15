import type { ApiEnvelope, Preprint } from './types';

const baseUrl = process.env.NEXT_PUBLIC_PREPRINT_API_BASE_URL || 'http://localhost:5002';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
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
