import React from 'react';
import SubscriptionsTableHeader from './SubscriptionsTableHeader';
import SubscriptionsTableContent from './SubscriptionsTableContent';
import SubscriptionsTableFooter from './SubscriptionsTableFooter';
import LoadingSkeleton from '../../../UI/Common/LoadingSkeleton';

export default function SubscriptionsTable({
  data,
  totalData,
  loading,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No subscriptions found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Get started by adding your first subscription
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
      <SubscriptionsTableHeader
        data={data}
        totalData={totalData}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <SubscriptionsTableContent
        data={data}
        viewMode={viewMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={onSort}
        onAction={onAction}
      />
      
      <SubscriptionsTableFooter data={data} totalData={totalData} />
    </div>
  );
}
