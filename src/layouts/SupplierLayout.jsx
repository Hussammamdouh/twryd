import React from 'react';
import Sidebar from '../UI/supplier/Sidebar';
import Topbar from '../UI/supplier/Topbar';
import { useLayout } from '../hooks/useLayout';

export default function SupplierLayout({ children, title }) {
  const { sidebarCollapsed } = useLayout();

  return (
    <div className="min-h-screen bg-theme-bg">
      <Sidebar />
      <Topbar title={title} />
      <main className={`pt-16 md:pt-20 px-4 md:px-8 transition-all duration-300 ${sidebarCollapsed ? 'pl-4 md:pl-20' : 'pl-4 md:pl-64'}`}>
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
} 