import React, { useState, useCallback } from 'react';
import { LayoutContext } from './LayoutContext';

export function LayoutProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const value = {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
} 