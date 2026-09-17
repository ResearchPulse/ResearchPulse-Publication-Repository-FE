import type { ApiEnvelope } from '@/shared/types';
import type { StudentPreprint, PreprintVersionInfo } from '../types';
import { studentPreprintMock } from './studentPreprintMock';

export class ApiUnavailableError extends Error {
  code = 'API_NOT_AVAILABLE' as const;
}

const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || process.env.PREPRINT_API_ENABLED !== 'true';

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
  listMine: async (): Promise<{ items: StudentPreprint[] }> => {
    if (isDemoMode) {
      return studentPreprintMock.listMine();
    }
    try {
      return await request<{ items: StudentPreprint[] }>('/mine');
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.listMine();
      }
      throw err;
    }
  },

  get: async (id: string): Promise<StudentPreprint> => {
    if (isDemoMode) {
      return studentPreprintMock.get(id);
    }
    try {
      return await request<StudentPreprint>('/' + encodeURIComponent(id));
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.get(id);
      }
      throw err;
    }
  },

  create: async (payload: {
    title: string;
    abstract: string;
    discipline?: string;
    keywords?: string[];
    supervisor?: string;
    file_name?: string;
    file_size?: string;
    submitNow?: boolean;
  }): Promise<StudentPreprint> => {
    if (isDemoMode) {
      return studentPreprintMock.create(payload);
    }
    try {
      return await request<StudentPreprint>('', { method: 'POST', body: JSON.stringify(payload) });
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.create(payload);
      }
      throw err;
    }
  },

  update: async (
    id: string,
    payload: {
      title?: string;
      abstract?: string;
      discipline?: string;
      keywords?: string[];
      supervisor?: string;
      file_name?: string;
      file_size?: string;
      change_summary?: string;
      submitRevision?: boolean;
    }
  ): Promise<StudentPreprint> => {
    if (isDemoMode) {
      return studentPreprintMock.update(id, payload);
    }
    try {
      return await request<StudentPreprint>('/' + encodeURIComponent(id), { method: 'PATCH', body: JSON.stringify(payload) });
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.update(id, payload);
      }
      throw err;
    }
  },

  submit: async (id: string): Promise<StudentPreprint> => {
    if (isDemoMode) {
      return studentPreprintMock.submit(id);
    }
    try {
      return await request<StudentPreprint>('/' + encodeURIComponent(id) + '/submit', { method: 'POST' });
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.submit(id);
      }
      throw err;
    }
  },

  withdraw: async (id: string): Promise<StudentPreprint> => {
    if (isDemoMode) {
      return studentPreprintMock.withdraw(id);
    }
    try {
      return await request<StudentPreprint>('/' + encodeURIComponent(id) + '/withdraw', { method: 'POST' });
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.withdraw(id);
      }
      throw err;
    }
  },

  versions: async (id: string): Promise<PreprintVersionInfo[]> => {
    if (isDemoMode) {
      return studentPreprintMock.versions(id);
    }
    try {
      return await request<PreprintVersionInfo[]>('/' + encodeURIComponent(id) + '/versions');
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        return studentPreprintMock.versions(id);
      }
      throw err;
    }
  },
};

export default studentPreprintApi;
