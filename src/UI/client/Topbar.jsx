import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../hooks/useLayout';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSwitcher from '../Common/LanguageSwitcher';

export default function Topbar({ title }) {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useLayout();
  const initials = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const toggleMobileMenu = () => {
    toggleMobileSidebar();
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            id="mobile-sidebar-toggle"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMobileMenu();
            }}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle mobile menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Page Title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
              {title || 'Client Dashboard'}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSwitcher variant="dropdown" size="small" />
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
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
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow">
              <span>{initials}</span>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex sm:hidden items-center gap-2">
            {/* Language Switcher - Mobile */}
            <LanguageSwitcher variant="dropdown" size="small" />
            
            <ThemeToggle />
            
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
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow">
              <span>{initials}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 