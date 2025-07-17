import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-6">
      <button
        className="px-4 py-2 bg-gray-200 text-gray-500 rounded font-semibold shadow"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-gray-700 font-medium">Page {page} of {totalPages}</span>
      <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold shadow"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
} 