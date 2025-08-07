import React from 'react';

export default function StatusBadge({ text, colorClass }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      {text}
    </span>
  );
} 