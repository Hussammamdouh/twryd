import React from 'react';

export default function ProfileCard({ name, email, phone, onLogout, role }) {
  // Get initials from name
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';
  return (
    <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col gap-6 max-w-md border border-gray-100">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-2xl shadow">
          {initials}
        </div>
        <div>
          <div className="text-lg font-bold text-gray-900 mb-1">{name}</div>
          {role && <div className="text-xs text-blue-500 font-semibold mb-1">{role}</div>}
          <div className="flex gap-2 items-center">
            <a href={`mailto:${email}`} className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded hover:underline transition">{email}</a>
            <a href={`tel:${phone}`} className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded hover:underline transition">{phone}</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 my-2" />
      <button
        onClick={onLogout}
        className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg shadow-lg transition w-full mt-2"
      >
        Logout
      </button>
    </div>
  );
} 