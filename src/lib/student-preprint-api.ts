import type { Preprint } from './student-types';

const apiBaseUrl = process.env.NEXT_PUBLIC_PREPRINT_API_BASE_URL ?? process.env.PREPRINT_API_BASE_URL ?? 'http://localhost:5002';
type ApiEnvelope<T> = { success: boolean; data: T; message?: string; code?: string };
export type UploadInit = { uploadToken: string; uploadUrl: string; expiresAt: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, credentials: 'include', headers: { 'Content-Type': 'application/json', ...init?.headers } });
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | { message?: string } | null;
  if (!response.ok) throw new Error(body && 'message' in body ? body.message ?? `Preprint API request failed: ${response.status}` : `Preprint API request failed: ${response.status}`);
  if (!body || !('success' in body) || !body.success) throw new Error('Preprint API returned an invalid response');
  return body.data;
}

export const preprintApi = {
  listMine: () => request<{ items: Preprint[] }>('/api/v1/preprints/mine'),
  get: (id: string) => request<Preprint>(`/api/v1/preprints/${id}`),
  create: (payload: unknown) => request<Preprint>('/api/v1/preprints', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: unknown) => request<Preprint>(`/api/v1/preprints/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  initUpload: (id: string, payload: unknown) => request<UploadInit>(`/api/v1/preprints/${id}/versions/upload-init`, { method: 'POST', body: JSON.stringify(payload) }),
  uploadFile: async (uploadUrl: string, file: File) => {
    const response = await fetch(new URL(uploadUrl, apiBaseUrl), { method: 'PUT', body: file, credentials: 'include', headers: { 'Content-Type': 'application/octet-stream' } });
    if (!response.ok) throw new Error('Manuscript upload failed');
  },
  completeUpload: (id: string, payload: unknown) => request<unknown>(`/api/v1/preprints/${id}/versions/complete`, { method: 'POST', body: JSON.stringify(payload) }),
  submit: (id: string) => request<Preprint>(`/api/v1/preprints/${id}/submit`, { method: 'POST' }),
};
