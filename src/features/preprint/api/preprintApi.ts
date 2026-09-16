import type { ApiEnvelope } from '@/shared/types';
import type { StudentPreprint } from '../types';

export class ApiUnavailableError extends Error {
  code = 'API_NOT_AVAILABLE' as const;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch('/api/preprints' + path, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | { code?: string; message?: string } | null;
  if (response.status === 501 || body?.code === 'API_NOT_AVAILABLE') {
    throw new ApiUnavailableError(body?.message || 'Preprint API is not available yet.');
  }
  if (!response.ok) throw new Error(body?.message || ('Preprint API request failed: ' + response.status));
  if (!body || !('success' in body) || !body.success) throw new Error('Preprint API returned an invalid response.');
  return body.data;
}

export const studentPreprintApi = {
  listMine: () => request<{ items: StudentPreprint[] }>('/mine'),
  get: (id: string) => request<StudentPreprint>('/' + encodeURIComponent(id)),
  create: (payload: { title: string; abstract: string }) => request<StudentPreprint>('', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: { title: string; abstract: string }) => request<StudentPreprint>('/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) }),
  submit: (id: string) => request<StudentPreprint>('/' + encodeURIComponent(id) + '/submit', { method: 'POST' }),
  withdraw: (id: string) => request<StudentPreprint>('/' + encodeURIComponent(id) + '/withdraw', { method: 'POST' }),
  versions: (id: string) => request<unknown[]>('/' + encodeURIComponent(id) + '/versions'),
};

export default studentPreprintApi;
