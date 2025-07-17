import React from 'react';

export default function Topbar({ title, onMenuClick }) {
  return (
    <header className="flex items-center justify-between h-16 px-2 md:px-8 bg-white border-b shadow-sm fixed md:left-64 top-0 right-0 z-20 transition-all duration-300">
      {/* Hamburger for mobile */}
      <button
        className="md:hidden mr-2 text-blue-700 text-3xl focus:outline-none"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <h1 className="text-2xl font-bold text-blue-700 tracking-tight drop-shadow-sm flex-1">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-3 py-1.5 rounded bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition-shadow focus:shadow-lg"
            style={{ width: 180 }}
          />
        </div>
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg shadow">
          {/* Use user initials or fallback */}
          <span>AD</span>
        </div>
      </div>
    </header>
  );
} 