import React, { useState, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Performance: Memoize navigation items
const navItems = [
  { 
    name: 'Profile', 
    to: '/supplier/dashboard/profile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) 
  },
  { 
    name: 'Client Invitations', 
    to: '/supplier/invitations', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" />
      </svg>
    ) 
  },
  { 
    name: 'Product Management', 
    to: '/supplier/dashboard/products', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) 
  },
  { 
    name: 'Warehouses', 
    to: '/supplier/dashboard/warehouses', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M3 10l9-7 9 7" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) 
  },
  { 
    name: 'Delivery Personnel', 
    to: '/supplier/dashboard/shipping-people', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 17h14M12 17V3m0 0l4 4m-4-4l-4 4" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ) 
  },
  { 
    name: 'Client-Based Discounts', 
    to: '/supplier/dashboard/client-discounts', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ) 
  },
  { 
    name: 'Product Discounts', 
    to: '/supplier/dashboard/product-discounts', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ) 
  },
  { 
    name: 'Orders Management', 
    to: '/supplier/dashboard/orders', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ) 
  },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  // Performance: Memoize current path
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // Performance: Memoize logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  }, [logout]);

  // Performance: Memoize toggle handler
  const handleToggle = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <aside
      className={`
        theme-sidebar h-full bg-gradient-to-b from-primary-600 via-primary-500 to-primary-400 text-white flex flex-col py-6 px-4 fixed left-0 top-0 z-20 min-h-screen shadow-xl transition-all duration-300
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      aria-label="Supplier sidebar navigation"
      role="complementary"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <svg className="w-8 h-8 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" />
        </svg>
        {!isCollapsed && (
          <span className="text-2xl font-extrabold tracking-tight">Twryd</span>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute top-4 right-2 p-2 text-white hover:bg-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1" aria-label="Supplier main navigation" role="navigation">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 rounded-lg my-1 font-semibold transition-all duration-150 text-base group relative
              ${isActive 
                ? 'bg-primary-600 text-white shadow border-l-4 border-primary-800' 
                : 'text-gray-700 hover:bg-primary-50 hover:text-primary-700'
              }
              ${isCollapsed ? 'justify-center px-3' : ''}
              `
            }
            tabIndex={0}
            aria-label={item.name}
            title={isCollapsed ? item.name : undefined}
          >
            <span className="w-6 h-6 flex items-center justify-center flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span>{item.name}</span>}
            
            {/* Active indicator for collapsed state */}
            {isCollapsed && currentPath === item.to && (
              <div className="absolute right-1 w-2 h-2 bg-white rounded-full"></div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      {!isCollapsed && user && (
        <div className="mt-auto pt-4 border-t border-primary-500">
          <div className="px-6 py-3">
            <div className="text-sm font-medium text-primary-100">
              {user.name || user.email}
            </div>
            <div className="text-xs text-primary-200">
              {user.role === 'supplier' ? 'Supplier' : 'User'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
            aria-label="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
} 