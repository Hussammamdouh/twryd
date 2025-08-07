import React from 'react';

export default function CategoryAvatar({ category, getIconUrl }) {
  if (category.icon) {
    return (
      <img
        src={getIconUrl(category.icon)}
        alt={category.name}
        className="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
        onError={(e) => {
          try {
            e.target.onerror = null;
            e.target.style.display = 'none';
            const parent = e.target.parentNode;
            if (parent) {
              parent.innerHTML = '<div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs">N/A</div>';
            }
          } catch (error) {
            console.warn('Error handling image load failure:', error);
          }
        }}
      />
    );
  }

  return (
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
  );
} 