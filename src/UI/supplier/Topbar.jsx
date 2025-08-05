import React from 'react';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { useLayout } from '../../hooks/useLayout';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, toggleMobileSidebar } = useLayout();
  const { t } = useSupplierTranslation();
  const initials = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  const toggleMobileMenu = () => {
    toggleMobileSidebar();
  };

  const handleLogout = () => {
    if (window.confirm(t('sidebar.logout_confirmation'))) {
      logout();
    }
  };

  return (
    <header className={`theme-topbar flex items-center justify-between h-16 px-4 sm:px-8 fixed top-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 ${sidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-64'}`}>
      {/* Left Section with Toggle and Title */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle - Mobile Only */}
        <button
          id="mobile-sidebar-toggle"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
          }}
          className="md:hidden p-2 text-theme-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Title */}
        <h1 className="text-lg sm:text-2xl font-bold text-theme-text tracking-tight drop-shadow-sm flex items-center h-full truncate">
          {title}
        </h1>
      </div>

      {/* Right Section with Controls */}
      <div className="flex items-center gap-3">
        {/* Desktop Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher variant="dropdown" size="small" />
          
          {/* Theme Toggle */}
          <ThemeToggle variant="button" />
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Logout"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          
          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow">
            <span>{initials}</span>
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Language Switcher - Mobile */}
          <LanguageSwitcher variant="dropdown" size="small" />
          
          {/* Theme Toggle - Mobile */}
          <ThemeToggle variant="button" />

          {/* Logout Button - Mobile */}
          <button
            onClick={handleLogout}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Logout"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          {/* User Avatar - Mobile */}
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shadow">
            <span>{initials}</span>
          </div>
        </div>
      </div>
    </header>
  );
} 