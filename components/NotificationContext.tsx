import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from './api';

type NotificationContextType = {
  unreadCount: number;
  refreshUnread: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnread: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<any>(null);

  const refreshUnread = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data.success) {
        setUnreadCount(res.data.count);
      }
    } catch {}
  };

  const startPolling = () => {
    refreshUnread();
    intervalRef.current = setInterval(refreshUnread, 5000);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}