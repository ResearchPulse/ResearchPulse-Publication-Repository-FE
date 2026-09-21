'use client';

import { useQuery } from '@tanstack/react-query';
import { studentPreprintApi, ApiUnavailableError } from '../api';
import type { StudentPreprint } from '../types';

const EMPTY_ITEMS: StudentPreprint[] = [];

export function usePreprintList() {
  const { data, isLoading, error, refetch } = useQuery<StudentPreprint[], Error>({
    queryKey: ['preprints', 'mine'],
    queryFn: async () => {
      const result = await studentPreprintApi.listMine();
      return result.items || [];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes fresh cache
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    placeholderData: (previousData) => previousData,
  });

  return {
    items: data ?? EMPTY_ITEMS,
    loading: isLoading,
    error: error ?? null,
    apiPending: error instanceof ApiUnavailableError,
    refetch,
  };
}

export default usePreprintList;
