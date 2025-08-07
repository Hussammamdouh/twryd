import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SubscriptionRequestsStatusBadge from './SubscriptionRequestsStatusBadge';
import ActionButtons from './ActionButtons';

export default function SubscriptionRequestsGridView({ 
  data, 
  onApprove, 
  onReject, 
  rowLoading, 
  actionResult 
}) {
  const { t } = useLanguage();

  const formatDate = (dateString) => {
    if (!dateString) return t('common.not_available');
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return t('common.not_available');
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return t('common.not_available');
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 lg:p-8">
      {data.map((request) => (
        <div
          key={request.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header with avatar and status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {(request.supplier?.name || request.supplier?.company_name || 'S').charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {request.supplier?.name || request.supplier?.company_name || t('common.not_available')}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {request.supplier?.email || t('common.not_available')}
                </p>
              </div>
            </div>
            <SubscriptionRequestsStatusBadge status={request.status} />
          </div>

          {/* Plan information */}
          <div className="space-y-3 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('subscription_requests.plan')}
              </h4>
              <p className="text-base font-semibold text-gray-900 dark:text-white">
                {request.plan?.name || t('common.not_available')}
              </p>
              <div className="mt-1">
                {request.plan?.is_custom ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    {t('subscription_requests.custom_plan')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('subscription_requests.standard_plan')}
                  </span>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('subscription_requests.price')}
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(request.plan?.price_per_month)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/month</span>
                {request.plan?.price_per_month && (
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('subscription_requests.request_date')}
              </h4>
              <p className="text-sm text-gray-900 dark:text-white">
                {formatDate(request.created_at)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <ActionButtons 
              request={request} 
              onApprove={onApprove} 
              onReject={onReject}
              rowLoading={rowLoading}
              actionResult={actionResult}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
