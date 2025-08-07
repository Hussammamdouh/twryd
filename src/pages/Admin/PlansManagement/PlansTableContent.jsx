import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import PlansTableView from './PlansTableView';
import LoadingSkeleton from '../../../UI/Common/LoadingSkeleton';

export default function PlansTableContent({
  data,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  const { t } = useLanguage();

  // Defensive check - ensure data is always an array
  const plans = Array.isArray(data) ? data : [];

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('plans.no_plans')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {t('plans.get_started')}
        </p>
      </div>
    );
  }

  return (
    <PlansTableView
      plans={plans}
      viewMode={viewMode}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={onSort}
      onAction={onAction}
    />
  );
}
