import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import ViewModeToggle from './ViewModeToggle';

export default function AreasTableHeader({
  data,
  totalData,
  viewMode,
  setViewMode
}) {
  const { t } = useLanguage();

  return (
    <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        {/* Left side - Results count */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{t('areas.showing', { from: data.length, to: data.length, total: totalData.length })}</span>
        </div>

        {/* Right side - View mode toggle */}
        <div className="flex items-center justify-end gap-4">
          <ViewModeToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      {/* Mobile results count */}
      <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{t('areas.showing', { from: data.length, to: data.length, total: totalData.length })}</span>
        </div>
      </div>
    </div>
  );
}
