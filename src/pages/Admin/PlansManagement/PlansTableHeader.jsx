import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SearchBar from './SearchBar';
import FilterDropdown from './FilterDropdown';
import ViewModeToggle from './ViewModeToggle';

export default function PlansTableHeader({
  data,
  totalData,
  searchTerm,
  setSearchTerm,
  selectedFilter,
  setSelectedFilter,
  viewMode,
  setViewMode
}) {
  const { t } = useLanguage();

  const filterOptions = [
    { value: 'all', label: t('plans.all_plans') },
    { value: 'standard', label: t('plans.standard_plans') },
    { value: 'custom', label: t('plans.custom_plans') }
  ];

  return (
    <div className="p-6 lg:p-8 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        {/* Left side - Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex-1 min-w-0">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder={t('plans.search_placeholder')}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <FilterDropdown
              label={t('plans.type')}
              value={selectedFilter}
              onChange={setSelectedFilter}
              options={filterOptions}
            />
          </div>
        </div>

        {/* Right side - View mode toggle and results count */}
        <div className="flex items-center justify-between lg:justify-end gap-4">
          <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t('plans.showing', { from: data.length, to: data.length, total: totalData.length })}</span>
          </div>
          
          <ViewModeToggle
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      </div>

      {/* Mobile results count */}
      <div className="lg:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>{t('plans.showing', { from: data.length, to: data.length, total: totalData.length })}</span>
        </div>
      </div>
    </div>
  );
}
