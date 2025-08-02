import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeToggle from '../../components/ThemeToggle';
import LanguageSwitcher from '../Common/LanguageSwitcher';

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Performance: Memoize user initials
  const userInitials = useMemo(() => {
    if (!user?.name) return 'AD';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }, [user?.name]);

  // Performance: Memoize handlers
  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
  }, []);

  const handleMenuClick = useCallback(() => {
    onMenuClick();
  }, [onMenuClick]);

  const handleUserMenuToggle = useCallback(() => {
    setShowUserMenu(prev => !prev);
  }, []);

  // Performance: Memoize logout handler
  const handleLogout = useCallback(() => {
    if (window.confirm(t('profile.logout_confirm'))) {
      logout();
    }
    setShowUserMenu(false);
  }, [logout, t]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setShowUserMenu(false);
    }
  }, []);

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu, handleKeyDown]);

  return (
    <header className="theme-topbar flex items-center justify-between h-16 px-8 fixed left-64 top-0 right-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden mr-2 text-theme-text text-3xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2 rounded p-1"
        onClick={handleMenuClick}
        aria-label="Open sidebar"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-theme-text tracking-tight drop-shadow-sm flex items-center h-full">
        {title}
      </h1>

      {/* Search and User Menu */}
      <div className="flex items-center gap-4 h-full">
        {/* Language Switcher */}
        <LanguageSwitcher size="small" />
        
        {/* Theme Toggle */}
        <ThemeToggle variant="button" />
        
        {/* Search Bar */}
        <div className="relative flex items-center h-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" />
            </svg>
          </span>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            value={searchValue}
            onChange={handleSearchChange}
            className="theme-input pl-10 pr-3 py-2 rounded text-sm transition-shadow focus:shadow-lg w-56 h-10"
            style={{ minWidth: 180 }}
            aria-label="Search"
          />
        </div>

        {/* User Menu */}
        <div className="relative user-menu">
          <button
            onClick={handleUserMenuToggle}
            className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow hover:bg-primary-200 dark:hover:bg-primary-800/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
            aria-label="User menu"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
          >
            <span>{userInitials}</span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="text-sm font-medium text-theme-text">
                  {user?.name || user?.email}
                </div>
                <div className="text-xs text-theme-text-secondary">
                  {user?.role === 'admin' ? 'Administrator' : 'User'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                {t('profile.logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 