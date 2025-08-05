import React, { useState } from 'react';
import ThemeToggle from '../../components/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';
import LanguageSwitcher from '../Common/LanguageSwitcher';
import { useLayout } from '../../hooks/useLayout';

export default function Topbar({ 
  title, 
  search, 
  onSearch, 
  status, 
  onStatusChange, 
  onInvite, 
  onAdd,
  addButtonText = "+ Invite New Client",
  searchPlaceholder = "Search by client email..."
}) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const handleAction = onAdd || onInvite;
  const { user } = useAuth();
  const { sidebarCollapsed, mobileSidebarOpen, toggleMobileSidebar } = useLayout();
  const initials = user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U');

  const toggleMobileMenu = () => {
    toggleMobileSidebar();
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <header className={`theme-topbar flex items-center justify-between h-16 px-4 sm:px-8 fixed top-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm transition-all duration-300 ${sidebarCollapsed ? 'left-0 md:left-16' : 'left-0 md:left-64'}`}>
      {/* Mobile Menu Toggle */}
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

      {/* Desktop Controls */}
      <div className="hidden md:flex items-center gap-4 h-full">
        {/* Language Switcher */}
        <LanguageSwitcher variant="dropdown" size="small" />
        {/* Theme Toggle */}
        <ThemeToggle variant="button" />
        <div className="relative flex items-center h-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="theme-input pl-10 pr-3 py-2 rounded text-sm transition-shadow focus:shadow-lg w-56 h-10"
            value={search}
            onChange={e => onSearch?.(e.target.value)}
            aria-label="Search"
            style={{ minWidth: 180 }}
          />
        </div>
        <select
          className="theme-input px-3 py-2 rounded text-sm h-10"
          value={status}
          onChange={e => onStatusChange?.(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        {handleAction && (
          <button
            className="theme-button px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2 h-10"
            onClick={handleAction}
            aria-label="Add new item"
          >
            {addButtonText}
          </button>
        )}
        
        {/* Logout Button - Desktop */}
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
        
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow">
          <span>{initials}</span>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="flex md:hidden items-center gap-2">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="p-2 text-theme-text hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          aria-label="Toggle search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
          </svg>
        </button>

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

      {/* Mobile Search Panel */}
      {showMobileSearch && (
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 shadow-lg md:hidden">
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary pointer-events-none">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
                </svg>
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                className="theme-input pl-10 pr-3 py-2 rounded text-sm w-full"
                value={search}
                onChange={e => onSearch?.(e.target.value)}
                aria-label="Search"
              />
            </div>

            {/* Status Filter */}
            <select
              className="theme-input px-3 py-2 rounded text-sm w-full"
              value={status}
              onChange={e => onStatusChange?.(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Action Button */}
            {handleAction && (
              <button
                className="theme-button px-4 py-2 rounded-lg font-bold shadow flex items-center justify-center gap-2 w-full"
                onClick={handleAction}
                aria-label="Add new item"
              >
                {addButtonText}
              </button>
            )}

            {/* Language Switcher - Mobile */}
            <div className="flex justify-center">
              <LanguageSwitcher variant="dropdown" size="small" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
} 