import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function CategoryStatusBadge({ isActive, onToggle }) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 min-h-[28px] ${
        isActive 
          ? 'bg-green-100 text-green-700 focus:ring-green-400 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40' 
          : 'bg-gray-100 text-gray-600 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      title="Toggle status"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {isActive ? t('common.active') : t('common.inactive')}
    </button>
  );
} 