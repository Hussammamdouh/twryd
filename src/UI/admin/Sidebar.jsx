import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Profile', to: '/admin-dashboard/profile', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { name: 'Admins', to: '/admin-dashboard/admins', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  ) },
  { name: 'Suppliers', to: '/admin-dashboard/suppliers', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v4a1 1 0 001 1h3m10-5v4a1 1 0 001 1h3m-7 4v4m0 0H7a2 2 0 01-2-2v-5a2 2 0 012-2h10a2 2 0 012 2v5a2 2 0 01-2 2h-5z" /></svg>
  ) },
  { name: 'Categories', to: '/admin-dashboard/categories', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M8 9h8M8 15h8" stroke="currentColor" strokeWidth="2" /></svg>
  ) },
  { name: 'Governates', to: '/admin-dashboard/governates', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm0-14a6 6 0 100 12 6 6 0 000-12z" /></svg>
  ) },
  { name: 'Areas', to: '/admin-dashboard/areas', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M4 9h16M9 20V9" stroke="currentColor" strokeWidth="2" /></svg>
  ) },
];

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-full w-64 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 text-white flex flex-col py-6 px-4 min-h-screen shadow-xl transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}
      style={{
        // On desktop, always visible; on mobile, slide in/out
        transitionProperty: 'transform',
      }}
      aria-label="Admin sidebar navigation"
      role="complementary"
    >
      {/* Mobile close button */}
      <button
        className="md:hidden absolute top-4 right-4 text-white text-3xl focus:outline-none"
        onClick={onClose}
        aria-label="Close sidebar"
        tabIndex={open ? 0 : -1}
      >
        &times;
      </button>
      <div className="flex items-center gap-3 mb-10 px-2">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg>
        <span className="text-2xl font-extrabold tracking-tight">Twryd</span>
      </div>
      <nav className="flex flex-col gap-2" aria-label="Admin main navigation" role="navigation">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 rounded-lg my-1 font-semibold transition-all duration-150 text-base group
              ${isActive ? 'bg-blue-600 text-white shadow border-l-4 border-blue-800' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
              `
            }
            onClick={onClose} // Close sidebar on mobile nav
            tabIndex={0}
            aria-label={item.name}
          >
            <span className="w-6 h-6 flex items-center justify-center">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
} 