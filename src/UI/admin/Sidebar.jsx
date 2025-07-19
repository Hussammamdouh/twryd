import React, { useState, useCallback, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Performance: Memoize navigation items
const navItems = [
  { 
    name: 'Profile', 
    to: '/admin-dashboard/profile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) 
  },
  { 
    name: 'Admins', 
    to: '/admin-dashboard/admins', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ) 
  },
  { 
    name: 'Suppliers', 
    to: '/admin-dashboard/suppliers', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 001 1h3m-7 4v4m0 0H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-5z" />
      </svg>
    ) 
  },
  { 
    name: 'Categories', 
    to: '/admin-dashboard/categories', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M8 9h8M8 15h8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ) 
  },
  { 
    name: 'Governates', 
    to: '/admin-dashboard/governates', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm0-14a6 6 0 100 12 6 6 0 000-12z" />
      </svg>
    ) 
  },
  { 
    name: 'Areas', 
    to: '/admin-dashboard/areas', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ) 
  },
];

export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  // Performance: Memoize close handler
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <aside
      className={`
        theme-sidebar fixed top-0 left-0 z-30 h-full bg-gradient-to-b from-primary-600 via-primary-500 to-primary-400 text-white flex flex-col py-6 px-4 min-h-screen shadow-xl transition-all duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
      aria-label="Admin sidebar navigation"
      role="complementary"
    >
      {/* Mobile close button */}
      <button
        className="md:hidden absolute top-4 right-4 text-white text-3xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 rounded z-10"
        onClick={handleClose}
        aria-label="Close sidebar"
        tabIndex={open ? 0 : -1}
      >
        &times;
      </button>

      {/* Toggle Button for Desktop */}
      <button
        onClick={handleToggle}
        className="hidden md:block absolute top-4 right-2 p-2 text-white hover:bg-primary-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

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

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1" aria-label="Admin main navigation" role="navigation">
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
            onClick={handleClose} // Close sidebar on mobile nav
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
              {user.role === 'admin' ? 'Administrator' : 'User'}
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