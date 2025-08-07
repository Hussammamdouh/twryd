import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AdminsTableHeader from './AdminsTableHeader';
import AdminsTableContent from './AdminsTableContent';
import AdminsTableFooter from './AdminsTableFooter';
import LoadingSkeleton from '../../../UI/Common/LoadingSkeleton';

export default function AdminsTable({
  data,
  totalData,
  loading,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  selectedRole,
  setSelectedRole,
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {t('administrators.no_administrators')}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {t('administrators.get_started')}
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
      <AdminsTableHeader
        data={data}
        totalData={totalData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <AdminsTableContent
        data={data}
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
      />
      
      <AdminsTableFooter data={data} totalData={totalData} />
    </div>
  );
} 