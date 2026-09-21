'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { studentPreprintApi, ApiUnavailableError } from '../api';
import type { StudentPreprint } from '../types';

export function usePreprintDetail(id: string) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<StudentPreprint, Error>({
    queryKey: ['preprint-detail', id],
    queryFn: () => studentPreprintApi.get(id),
    initialData: () => {
      const cachedList = queryClient.getQueryData<StudentPreprint[]>(['preprints', 'mine']);
      return cachedList?.find((p) => p.id === id);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes fresh cache
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  return {
    item: data ?? null,
    loading: isLoading,
    error: error ?? null,
    apiPending: error instanceof ApiUnavailableError,
  };
}

export default usePreprintDetail;
