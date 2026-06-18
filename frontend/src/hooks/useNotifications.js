import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notificationApi";

const POLL_INTERVAL = 30_000;

export const useNotifications = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const userId = user?.id;

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    try {
      const [notifs, count] = await Promise.all([
        getNotifications(userId),
        getUnreadCount(userId),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch {
      // silently ignore network errors during background polling
    }
  }, [userId]);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // ignore
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      await markAllNotificationsRead(userId);
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: now }))
      );
      setUnreadCount(0);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetchAll };
};
