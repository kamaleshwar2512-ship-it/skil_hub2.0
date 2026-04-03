import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

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
    if (!isAuthenticated) { 
      setUnreadCount(0); 
      setNotifications([]); 
      return; 
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      query: { userId: user.id },
      withCredentials: true
    });

    socket.on("new_notification", (notification) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  const markAllRead = useCallback(() => setUnreadCount(0), []);
  const decrementCount = useCallback(() => setUnreadCount((c) => Math.max(0, c - 1)), []);

  return (
    <NotificationContext.Provider value={{ 
      unreadCount, 
      fetchUnreadCount, 
      markAllRead, 
      decrementCount,
      notifications,
      setNotifications
    }}>
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
