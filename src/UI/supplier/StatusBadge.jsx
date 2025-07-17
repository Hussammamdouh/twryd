import React from 'react';

const statusStyles = {
  pending: 'bg-orange-100 text-orange-600',
  accepted: 'bg-green-100 text-green-600',
  declined: 'bg-red-100 text-red-600',
};

export default function StatusBadge({ status }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`px-3 py-1 rounded text-xs font-semibold ${statusStyles[status] || 'bg-gray-100 text-gray-500'}`}>
      {label}
    </span>
  );
} 