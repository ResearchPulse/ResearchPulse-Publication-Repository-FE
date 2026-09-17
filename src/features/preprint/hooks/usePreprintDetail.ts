'use client';

import { useEffect, useState } from 'react';
import { studentPreprintApi, ApiUnavailableError } from '../api';
import type { StudentPreprint } from '../types';

export function usePreprintDetail(id: string) {
  const [item, setItem] = useState<StudentPreprint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    studentPreprintApi.get(id)
      .then((result) => { if (active) setItem(result); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason : new Error('Unable to load preprint.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return { item, loading, error, apiPending: error instanceof ApiUnavailableError };
}

export default usePreprintDetail;
