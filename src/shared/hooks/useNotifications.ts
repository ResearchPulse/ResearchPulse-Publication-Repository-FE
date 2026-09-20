'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../api/notificationApi';
import { AppNotification, ListNotificationsResponse } from '../types/notification';

export const NOTIFICATIONS_LIST_QUERY_KEY = ['notifications-list'];
export const UNREAD_COUNT_QUERY_KEY = ['notifications-unread-count'];

export function useNotifications(options: { page?: number; limit?: number; autoConnect?: boolean } = {}) {
  const { page = 1, limit = 20, autoConnect = true } = options;
  const queryClient = useQueryClient();
  const [hasNewArrival, setHasNewArrival] = useState(false);

  // 1. Fetch unread count (initial load once, real-time updates pushed via SSE)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: Infinity,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  // 2. Fetch notifications list (initial load once, real-time items pushed via SSE)
  const {
    data: listData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...NOTIFICATIONS_LIST_QUERY_KEY, { page, limit }],
    queryFn: () => notificationApi.listNotifications({ page, limit }),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // 3. Mutation: Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onMutate: async (id: string) => {
      // Optimistically update list
      queryClient.setQueriesData({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY }, (old: ListNotificationsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: Math.max(0, old.unreadCount - 1),
          items: old.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        };
      });

      // Optimistically update unread count
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (prev: number | undefined) => Math.max(0, (prev || 0) - 1));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
    },
  });

  // 4. Mutation: Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      queryClient.setQueriesData({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY }, (old: ListNotificationsResponse | undefined) => {
        if (!old) return old;
        return {
          ...old,
          unreadCount: 0,
          items: old.items.map((item) => ({ ...item, isRead: true })),
        };
      });
      queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, 0);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
    },
  });

  // 5. Setup SSE Stream
  useEffect(() => {
    if (!autoConnect || typeof window === 'undefined') return;

    let es: EventSource | null = null;
    let retryTimer: NodeJS.Timeout | null = null;

    let hasDisconnected = false;

    function connect() {
      try {
        es = new EventSource('/api/notifications/stream', { withCredentials: true });

        es.onopen = () => {
          if (hasDisconnected) {
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY });
            hasDisconnected = false;
          }
        };

        const handleNewNotification = (data: AppNotification) => {
          setHasNewArrival(true);
          setTimeout(() => setHasNewArrival(false), 3000);

          // Update query cache immediately
          queryClient.setQueriesData({ queryKey: NOTIFICATIONS_LIST_QUERY_KEY }, (old: ListNotificationsResponse | undefined) => {
            if (!old) {
              return {
                items: [data],
                unreadCount: 1,
                pagination: { page: 1, limit, total: 1, totalPages: 1 },
              };
            }
            // Avoid duplicate items
            if (old.items.some((item) => item.id === data.id)) return old;

            return {
              ...old,
              unreadCount: old.unreadCount + 1,
              pagination: { ...old.pagination, total: old.pagination.total + 1 },
              items: [data, ...old.items],
            };
          });

          // Increment unread count
          queryClient.setQueryData(UNREAD_COUNT_QUERY_KEY, (prev: number | undefined) => (prev || 0) + 1);
        };

        es.addEventListener('notification', (event) => {
          try {
            const data = JSON.parse(event.data);
            handleNewNotification(data);
          } catch {
            // Ignore parse errors
          }
        });

        es.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            handleNewNotification(data);
          } catch {
            // Ignore non-json (ping/connected comments)
          }
        };

        es.onerror = () => {
          hasDisconnected = true;
          if (es) {
            es.close();
            es = null;
          }
          // Retry connection after 3 seconds
          if (retryTimer) clearTimeout(retryTimer);
          retryTimer = setTimeout(connect, 3000);
        };
      } catch {
        hasDisconnected = true;
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      if (es) es.close();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [autoConnect, limit, queryClient]);

  const markAsRead = useCallback((id: string) => markReadMutation.mutate(id), [markReadMutation]);
  const markAllAsRead = useCallback(() => markAllReadMutation.mutate(), [markAllReadMutation]);

  return {
    notifications: listData?.items || [],
    unreadCount,
    pagination: listData?.pagination,
    isLoading,
    isError,
    hasNewArrival,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}
