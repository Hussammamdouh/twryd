import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AreasTableHeader from './AreasTableHeader';
import AreasTableContent from './AreasTableContent';
import AreasTableFooter from './AreasTableFooter';
import LoadingSkeleton from '../../../UI/Common/LoadingSkeleton';

export default function AreasTable({
  data,
  totalData,
  loading,
  searchTerm,
  setSearchTerm,
  selectedGovernorate,
  setSelectedGovernorate,
  governorates,
  viewMode,
  setViewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <LoadingSkeleton type="table" />
        </div>
      </div>
    );
  }

  if (totalData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 lg:p-8">
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('areas.no_areas')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('areas.get_started')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <AreasTableHeader
        data={data}
        totalData={totalData}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <AreasTableContent
        data={data}
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
        governorates={governorates}
        selectedGovernorate={selectedGovernorate}
      />
      
      <AreasTableFooter data={data} totalData={totalData} />
    </div>
  );
}
