import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../hooks/useLayout';

// Performance: Memoize navigation items
const navItems = [
  { 
    name: 'Dashboard Home', 
    to: '/supplier/dashboard/home', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0h-2a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2z" />
      </svg>
    ) 
  },
  { 
    name: 'Profile', 
    to: '/supplier/dashboard/profile', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) 
  },
  { 
    name: 'Client Invitations', 
    to: '/supplier/invitations', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" />
      </svg>
    ) 
  },
  { 
    name: 'Product Management', 
    to: '/supplier/dashboard/products', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) 
  },
  { 
    name: 'Warehouses', 
    to: '/supplier/dashboard/warehouses', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M3 10l9-7 9 7" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) 
  },
  { 
    name: 'Delivery Personnel', 
    to: '/supplier/dashboard/shipping-people', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17h14M12 17V3m0 0l4 4m-4-4l-4 4" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ) 
  },
  { 
    name: 'Client-Based Discounts', 
    to: '/supplier/dashboard/client-discounts', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ) 
  },
  { 
    name: 'Product Discounts', 
    to: '/supplier/dashboard/product-discounts', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ) 
  },
  { 
    name: 'Orders Management', 
    to: '/supplier/dashboard/orders', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ) 
  },
  { 
    name: 'Installments Management', 
    to: '/supplier/dashboard/installments', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ) 
  },
  { 
    name: 'Virtual Client Management', 
    to: '/supplier/dashboard/virtual-client-management', 
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ) 
  },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } = useLayout();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Performance: Memoize current path
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Performance: Memoize logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  }, [logout]);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [location.pathname, isMobile, sidebarCollapsed, setSidebarCollapsed]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('supplier-sidebar');
      const mobileToggle = document.getElementById('mobile-sidebar-toggle');
      
      if (isMobile && 
          sidebar && 
          !sidebar.contains(event.target) && 
          mobileToggle && 
          !mobileToggle.contains(event.target) && 
          !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarCollapsed, setSidebarCollapsed]);

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      <aside
        id="supplier-sidebar"
        className={`
          theme-sidebar h-full bg-gradient-to-b from-primary-600 via-primary-500 to-primary-400 text-white flex flex-col py-8 px-4 fixed left-0 top-0 z-20 min-h-screen shadow-xl border-r border-primary-700 transition-all duration-300
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${isMobile ? 'transform transition-transform duration-300' : ''}
          ${sidebarCollapsed && isMobile ? '-translate-x-full' : 'translate-x-0'}
        `}
        aria-label="Supplier sidebar navigation"
        role="complementary"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">Twryd</span>
          )}
        </div>

        {/* Toggle Button - Desktop */}
        <button
          onClick={toggleSidebar}
          className="absolute top-4 right-2 p-2 text-white hover:bg-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 hidden md:block"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          tabIndex={0}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Close Button - Mobile */}
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="absolute top-4 right-2 p-2 text-white hover:bg-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600 md:hidden"
          aria-label="Close sidebar"
          tabIndex={0}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-1 mt-2 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-700 scrollbar-track-transparent" aria-label="Supplier main navigation" role="navigation">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-3 rounded-lg my-1 font-semibold transition-all duration-200 text-base group relative flex-shrink-0
                ${isActive
                  ? 'bg-primary-700 text-white shadow border-l-4 border-white'
                  : 'text-primary-100 hover:bg-primary-400/40 hover:text-white focus:bg-primary-400/60 focus:text-white'}
                ${sidebarCollapsed ? 'justify-center px-3' : ''}
                `
              }
              onClick={() => {
                // Close mobile sidebar when clicking a link
                if (isMobile) {
                  setSidebarCollapsed(true);
                }
              }}
              tabIndex={0}
              aria-label={item.name}
              title={sidebarCollapsed ? item.name : undefined}
            >
              <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span className="text-sm sm:text-base">{item.name}</span>}
              
              {/* Active indicator for collapsed state */}
              {sidebarCollapsed && currentPath === item.to && (
                <div className="absolute right-1 w-2 h-2 bg-white rounded-full border border-primary-700"></div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout */}
        {!sidebarCollapsed && user && (
          <div className="mt-auto pt-6 border-t border-primary-500">
            <div className="flex items-center gap-3 px-6 py-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow">
                {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-white truncate">
                  {user.name || user.email}
                </div>
                <div className="text-xs text-primary-200">
                  {user.role === 'supplier' ? 'Supplier' : 'User'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-3 text-primary-100 hover:bg-primary-400/40 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Logout"
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm sm:text-base">Logout</span>
            </button>
          </div>
        )}

        {/* Mobile User Info - Collapsed State */}
        {sidebarCollapsed && user && (
          <div className="mt-auto pt-6 border-t border-primary-500">
            <div className="flex justify-center">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shadow">
                {user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : 'U')}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-3 text-primary-100 hover:bg-primary-400/40 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white mt-2"
              aria-label="Logout"
              tabIndex={0}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
} 