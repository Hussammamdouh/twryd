import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import ActionButtons from './ActionButtons';
import StatusBadge from '../../../UI/supplier/StatusBadge';

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return '-';
  }
};

export default function PlansTableView({
  plans,
  viewMode,
  sortBy,
  sortOrder,
  onSort,
  onAction
}) {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('plans.name')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('plans.price_per_month')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('plans.max_clients')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('plans.is_custom')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('plans.is_active')}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('common.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
          {plans.map((plan) => (
            <tr
              key={plan.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {plan.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {plan.name_ar}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white font-medium">
                  {formatCurrency(plan.price_per_month)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('plans.per_month')}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 dark:text-white">
                  {plan.max_clients ? plan.max_clients : t('plans.unlimited')}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge
                  status={plan.is_custom ? 'custom' : 'standard'}
                  text={plan.is_custom ? t('plans.custom') : t('plans.standard')}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <StatusBadge
                  status={plan.is_active ? 'active' : 'inactive'}
                  text={plan.is_active ? t('common.active') : t('common.inactive')}
                />
              </td>
              <td className="px-4 py-4 whitespace-nowrap">
                <ActionButtons
                  onEdit={() => onAction('edit', plan)}
                  onDelete={() => onAction('delete', plan)}
                  editTitle={t('plans.edit')}
                  deleteTitle={t('plans.delete')}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
