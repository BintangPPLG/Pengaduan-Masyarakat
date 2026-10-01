import client from './client';

export async function fetchNotifications({ page = 1, limit = 20, type } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (type) params.append('type', type);
  const { data } = await client.get(`/notifications?${params}`);
  return data;
}

export async function fetchUnreadCount() {
  const { data } = await client.get('/notifications/unread-count');
  return data; // { count }
}

export async function markNotificationRead(id) {
  const { data } = await client.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await client.patch('/notifications/read-all');
  return data;
}
