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
];

export default function Sidebar() {
  return (
    <aside className="h-full w-64 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 text-white flex flex-col py-6 px-4 fixed left-0 top-0 z-20 min-h-screen shadow-xl">
      <div className="flex items-center gap-3 mb-10 px-2">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg>
        <span className="text-2xl font-extrabold tracking-tight">Twryd</span>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium text-white hover:bg-blue-700/80 hover:shadow-md ${isActive ? 'bg-white text-blue-700 font-bold shadow' : ''}`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
} 