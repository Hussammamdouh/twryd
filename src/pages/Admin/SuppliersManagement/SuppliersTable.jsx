import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SuppliersTableHeader from './SuppliersTableHeader';
import SuppliersTableContent from './SuppliersTableContent';
import SuppliersTableFooter from './SuppliersTableFooter';
import LoadingSkeleton from '../../../UI/Common/LoadingSkeleton';

export default function SuppliersTable({
  data,
  totalData,
  loading,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedCategory,
  setSelectedCategory,
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('suppliers.no_suppliers')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('suppliers.get_started')}
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
      <SuppliersTableHeader
        data={data}
        totalData={totalData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <SuppliersTableContent
        data={data}
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
      />
      
      <SuppliersTableFooter data={data} totalData={totalData} />
    </div>
  );
} 