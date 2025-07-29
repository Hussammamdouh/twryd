import React from 'react';
import Sidebar from '../UI/supplier/Sidebar';
import Topbar from '../UI/supplier/Topbar';
import { useLayout } from '../hooks/useLayout';

export default function SupplierLayout({ children, title, search, onSearch, status, onStatusChange, onAdd, addButtonText, searchPlaceholder }) {
  const { sidebarCollapsed } = useLayout();

  return (
    <div className="min-h-screen bg-theme-bg">
      <Sidebar />
      <Topbar
        title={title}
        search={search}
        onSearch={onSearch}
        status={status}
        onStatusChange={onStatusChange}
        onAdd={onAdd}
        addButtonText={addButtonText}
        searchPlaceholder={searchPlaceholder}
      />
      <main className={`pt-20 pr-8 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 