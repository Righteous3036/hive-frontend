import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import api, { getToken } from "./api";
import { useUser } from "./UserContext";

type NotificationContextType = {
  unreadCount: number;
  refreshUnread: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  refreshUnread: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<any>(null);

  const refreshUnread = useCallback(async () => {
    const token = getToken();
    if (!token && !user) {
      setUnreadCount(0);
      return;
    }

    try {
      // 1. Try dedicated unread-count endpoint
      const res = await api.get("/notifications/unread-count");
      if (res.data?.success) {
        const count =
          typeof res.data.count === "number"
            ? res.data.count
            : typeof res.data.unreadCount === "number"
            ? res.data.unreadCount
            : typeof res.data.unread_count === "number"
            ? res.data.unread_count
            : 0;
        setUnreadCount(count);
        return;
      }
    } catch {
      // 2. Fallback: If /notifications/unread-count is unavailable, calculate from /notifications
      try {
        const listRes = await api.get("/notifications");
        if (listRes.data?.success && Array.isArray(listRes.data.notifications)) {
          const count = listRes.data.notifications.filter(
            (n: any) => !n.is_read && !n.read
          ).length;
          setUnreadCount(count);
          return;
        }
      } catch {
        // Silently preserve current count or error state
      }
    }
  }, [user]);

  useEffect(() => {
    const isAuthenticated = !!(user || getToken());

    if (isAuthenticated) {
      refreshUnread();
      if (!intervalRef.current) {
        // Real-time synchronization interval
        intervalRef.current = setInterval(refreshUnread, 8000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setUnreadCount(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, refreshUnread]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}