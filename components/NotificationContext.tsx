import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api, { getToken } from "./api";
import { useUser } from "./UserContext";

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
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<any>(null);

  const refreshUnread = async () => {
    if (!getToken() && !user) return;
    try {
      const res = await api.get("/notifications/unread-count");
      if (res.data.success) {
        setUnreadCount(res.data.count);
      }
    } catch {}
  };

  useEffect(() => {
    const isAuthenticated = !!(user || getToken());

    if (isAuthenticated) {
      refreshUnread();
      if (!intervalRef.current) {
        intervalRef.current = setInterval(refreshUnread, 10000);
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
  }, [user]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refreshUnread }}>
      {children}
    </NotificationContext.Provider>
  );
}