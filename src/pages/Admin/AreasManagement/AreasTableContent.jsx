import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AreasTableView from './AreasTableView';

export default function AreasTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction,
  governorates,
  selectedGovernorate
}) {
  const { t } = useLanguage();

  // Defensive check - ensure data is always an array
  const areas = Array.isArray(data) ? data : [];

  if (areas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <div>
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {selectedGovernorate === '' ? t('areas.select_governorate') : t('areas.no_areas')}
            </span>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
              {selectedGovernorate === '' 
                ? t('areas.choose_governorate') 
                : t('messages.try_adjusting_filters')
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AreasTableView 
      areas={areas} 
      governorates={governorates} 
      viewMode={viewMode}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onAction={onAction}
    />
  );
}
