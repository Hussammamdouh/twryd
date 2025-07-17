import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Profile', to: '/supplier/dashboard/profile', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ) },
  { name: 'Client Invitations', to: '/supplier/invitations', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 01-8 0m8 0a4 4 0 00-8 0m8 0V8a4 4 0 00-8 0v4m8 0v4a4 4 0 01-8 0v-4" /></svg>
  ) },
  { name: 'Product Management', to: '/supplier/dashboard/products', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M3 9h18M9 21V9" stroke="currentColor" strokeWidth="2" /></svg>
  ) },
  { name: 'Warehouses', to: '/supplier/dashboard/warehouses', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="10" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" fill="none" /><path d="M3 10l9-7 9 7" stroke="currentColor" strokeWidth="2" /></svg>
  ) },
  { name: 'Delivery Personnel', to: '/supplier/dashboard/shipping-people', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14M12 17V3m0 0l4 4m-4-4l-4 4" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
  ) },
];

export default function Sidebar() {
  return (
    <aside
      className="h-full w-64 bg-gradient-to-b from-blue-600 via-blue-500 to-blue-400 text-white flex flex-col py-6 px-4 fixed left-0 top-0 z-20 min-h-screen shadow-xl"
      aria-label="Supplier sidebar navigation"
      role="complementary"
    >
      <div className="flex items-center gap-3 mb-10 px-2">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" /></svg>
        <span className="text-2xl font-extrabold tracking-tight">Twryd</span>
      </div>
      <nav className="flex flex-col gap-2" aria-label="Supplier main navigation" role="navigation">
        {navItems.map(item => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 rounded-lg my-1 font-semibold transition-all duration-150 text-base group
              ${isActive ? 'bg-blue-600 text-white shadow border-l-4 border-blue-800' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}
              `
            }
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