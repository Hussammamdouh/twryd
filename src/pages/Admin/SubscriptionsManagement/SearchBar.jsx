import React from 'react';

export default function SearchBar({ searchTerm, setSearchTerm, placeholder }) {
  return (
    <input
      type="text"
      className="theme-input w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      placeholder={placeholder}
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  );
}
