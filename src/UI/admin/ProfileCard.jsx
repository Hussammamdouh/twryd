import React from 'react';

export default function ProfileCard({ name, email, phone, onLogout, role }) {
  // Get initials from name
  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'AD';
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-xl flex flex-col gap-4 sm:gap-6 max-w-xs sm:max-w-md border border-gray-100 w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-2">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-extrabold text-xl sm:text-2xl shadow">
          {initials}
        </div>
        <div className="flex flex-col items-center sm:items-start">
          <div className="text-base sm:text-lg font-bold text-gray-900 mb-1">{name}</div>
          {role && <div className="text-xs text-blue-500 font-semibold mb-1">{role}</div>}
          <div className="flex gap-1 sm:gap-2 items-center flex-wrap justify-center sm:justify-start">
            <a href={`mailto:${email}`} className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded hover:underline transition break-all">{email}</a>
            <a href={`tel:${phone}`} className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded hover:underline transition break-all">{phone}</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 my-2" />
      <button
        onClick={onLogout}
        className="px-4 sm:px-6 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-bold rounded-lg shadow-lg transition w-full mt-2 text-sm sm:text-base"
      >
        Logout
      </button>
    </div>
  );
} 