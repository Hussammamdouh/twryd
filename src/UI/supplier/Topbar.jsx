import React from 'react';
import ThemeToggle from '../../components/ThemeToggle';

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
  const handleAction = onAdd || onInvite;
  
  return (
    <header className="theme-topbar flex items-center justify-between h-16 px-8 fixed left-64 top-0 right-0 z-10">
      <h1 className="text-2xl font-bold text-theme-text tracking-tight drop-shadow-sm">{title}</h1>
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle variant="button" />
        
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-secondary pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
          </span>
          <input
            type="text"
            placeholder={searchPlaceholder}
            className="theme-input pl-10 pr-3 py-2 rounded text-sm transition-shadow focus:shadow-lg"
            style={{ width: 220 }}
            value={search}
            onChange={e => onSearch?.(e.target.value)}
            aria-label="Search"
          />
        </div>
        <select
          className="theme-input px-3 py-2 rounded text-sm"
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
        <button
          className="theme-button px-4 py-2 rounded-lg font-bold shadow flex items-center gap-2"
          onClick={handleAction}
          aria-label="Add new item"
        >
          {addButtonText}
        </button>
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg shadow">
          {/* Use user initials or fallback */}
          <span>SP</span>
        </div>
      </div>
    </header>
  );
} 