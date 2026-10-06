import React, { createContext, useContext, useState } from 'react';

interface SidebarContextType {
  isSidebarVisible: boolean;
  setIsSidebarVisible: (visible: boolean) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const defaultContext: SidebarContextType = {
  isSidebarVisible: false,
  setIsSidebarVisible: () => {},
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
};

const SidebarContext = createContext<SidebarContextType>(defaultContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Sidebar is hidden by default on web and larger screens
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);
  const openSidebar = () => setIsSidebarVisible(true);
  const closeSidebar = () => setIsSidebarVisible(false);

  return (
    <SidebarContext.Provider
      value={{
        isSidebarVisible,
        setIsSidebarVisible,
        toggleSidebar,
        openSidebar,
        closeSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  return context || defaultContext;
}
