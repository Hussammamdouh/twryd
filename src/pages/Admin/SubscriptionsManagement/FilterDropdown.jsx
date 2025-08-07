import React from 'react';

export default function FilterDropdown({ label, value, onChange, options }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        className="theme-input px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}
