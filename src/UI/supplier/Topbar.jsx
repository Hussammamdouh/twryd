import React from 'react';

export default function Topbar({ title, search, onSearch, status, onStatusChange, onInvite }) {
  return (
    <header className="flex items-center justify-between h-16 px-8 bg-white border-b shadow-sm fixed left-64 top-0 right-0 z-10">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight drop-shadow-sm">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search by client email..."
            className="pl-10 pr-3 py-2 rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow focus:shadow-lg"
            style={{ width: 220 }}
            value={search}
            onChange={e => onSearch?.(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 rounded bg-gray-100 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={status}
          onChange={e => onStatusChange?.(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="declined">Declined</option>
        </select>
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition flex items-center gap-2"
          onClick={onInvite}
        >
          + Invite New Client
        </button>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow">
          {/* Use user initials or fallback */}
          <span>SP</span>
        </div>
      </div>
    </header>
  );
} 