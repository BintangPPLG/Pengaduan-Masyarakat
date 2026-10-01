import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { fetchUnreadCount } from '../api/notificationsApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const POLL_INTERVAL_MS = 30000; // 30 detik — mudah diupgrade ke WebSocket nanti

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setUnreadCount(0);
      return;
    }
    try {
      const data = await fetchUnreadCount();
      setUnreadCount(data.count ?? 0);
    } catch {
      // Gagal polling tidak merusak UI
    }
  }, [token]);

  useEffect(() => {
    refresh();

    // Mulai polling
    intervalRef.current = setInterval(refresh, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications harus di dalam NotificationProvider');
  return ctx;
}
