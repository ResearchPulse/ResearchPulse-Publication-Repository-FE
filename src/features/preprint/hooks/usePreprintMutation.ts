'use client';

import { useState } from 'react';
import { ApiUnavailableError } from '../api';

export function usePreprintMutation<TArgs extends unknown[], TResult>(action: (...args: TArgs) => Promise<TResult>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...args: TArgs) => {
    setLoading(true);
    setError(null);
    try { return await action(...args); }
    catch (reason: unknown) {
      const normalized = reason instanceof Error ? reason : new Error('Preprint action failed.');
      setError(normalized);
      throw normalized;
    } finally { setLoading(false); }
  };

  return { execute, loading, error, apiPending: error instanceof ApiUnavailableError };
}

export default usePreprintMutation;
