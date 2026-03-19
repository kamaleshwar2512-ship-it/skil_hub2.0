import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axiosInstance.get('/notifications?unread_only=true&limit=1');
      setUnreadCount(data.meta?.unreadCount ?? 0);
    } catch {
      // Silently fail — not critical
    }
  }, [isAuthenticated]);

  // Initial fetch + polling every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return; }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);
  const decrementCount = useCallback(() => setUnreadCount((c) => Math.max(0, c - 1)), []);

  return (
    <NotificationContext.Provider value={{ unreadCount, fetchUnreadCount, markAllRead, decrementCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}

export default NotificationContext;
