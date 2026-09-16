'use client';

import { useEffect, useState } from 'react';
import { studentPreprintApi, ApiUnavailableError } from '../api';
import type { StudentPreprint } from '../types';

export function usePreprintList() {
  const [items, setItems] = useState<StudentPreprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;
    studentPreprintApi.listMine()
      .then((result) => { if (active) setItems(result.items || []); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason : new Error('Unable to load preprints.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return { items, loading, error, apiPending: error instanceof ApiUnavailableError };
}

export default usePreprintList;
