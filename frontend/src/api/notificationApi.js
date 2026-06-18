import apiClient from "@/lib/apiClient";

export const getNotifications = async (userId) => {
  const res = await apiClient.get('/notification/all', { params: { userId } });
  return res.data.notifications;
};

export const getUnreadCount = async (userId) => {
  const res = await apiClient.get('/notification/unread-count', { params: { userId } });
  return res.data.count;
};

export const markNotificationRead = async (id) => {
  const res = await apiClient.put(`/notification/${id}/read`);
  return res.data.notification;
};

export const markAllNotificationsRead = async (userId) => {
  const res = await apiClient.put('/notification/read-all', { userId });
  return res.data;
};
