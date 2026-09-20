import { ListNotificationsResponse } from '../types/notification';

export const notificationApi = {
  async listNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }): Promise<ListNotificationsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

    const res = await fetch(`/api/notifications?${searchParams.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const json = await res.json();
    return json.data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await fetch('/api/notifications/unread-count', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch unread count');
    const json = await res.json();
    return json.data?.unreadCount || 0;
  },

  async markAsRead(id: string): Promise<boolean> {
    const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return false;
    const json = await res.json();
    return Boolean(json.success);
  },

  async markAllAsRead(): Promise<number> {
    const res = await fetch('/api/notifications/read-all', {
      method: 'PATCH',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json.data?.updatedCount || 0;
  },
};
