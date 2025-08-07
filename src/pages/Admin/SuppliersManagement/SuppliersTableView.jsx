import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SupplierAvatar from './SupplierAvatar';
import SupplierStatusBadge from './SupplierStatusBadge';
import SupplierCategoryBadge from './SupplierCategoryBadge';
import ActionButtons from './ActionButtons';

export default function SuppliersTableView({
  data,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  const { t } = useLanguage();

  const handleSort = (column) => {
    onSort(column);
  };

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    
    return sortOrder === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                {t('common.name')}
                {getSortIcon('name')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden md:table-cell"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center gap-2">
                {t('common.email')}
                {getSortIcon('email')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
              {t('common.phone')}
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleSort('category')}
            >
              <div className="flex items-center gap-2">
                {t('suppliers.category')}
                {getSortIcon('category')}
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden md:table-cell"
              onClick={() => handleSort('is_active')}
            >
              <div className="flex items-center gap-2">
                {t('common.status')}
                {getSortIcon('is_active')}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('common.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((supplier) => (
            <tr 
              key={supplier.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <SupplierAvatar supplier={supplier} />
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {supplier.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 md:hidden">
                      {supplier.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <div className="text-sm text-gray-900 dark:text-white">{supplier.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                <div className="text-sm text-gray-900 dark:text-white">{supplier.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <SupplierCategoryBadge category={supplier.category?.name} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                <SupplierStatusBadge isActive={supplier.is_active} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <ActionButtons supplier={supplier} onAction={onAction} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 