import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SubscriptionStatusBadge from './SubscriptionStatusBadge';
import ActionButtons from './ActionButtons';

export default function SubscriptionsGridView({ data, onAction }) {
  const { t } = useLanguage();

  if (!data.length) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t('subscriptions.no_subscriptions')}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6 lg:p-8">
      {data.map((subscription) => (
        <div
          key={subscription.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          {/* Header with status and actions */}
          <div className="flex items-start justify-between mb-4">
            <SubscriptionStatusBadge status={subscription.status} />
            <ActionButtons subscription={subscription} onAction={onAction} />
          </div>

          {/* Subscription info */}
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {subscription.supplier?.name || subscription.supplier?.company_name || t('common.not_available')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {subscription.supplier?.email || t('common.not_available')}
              </p>
            </div>
            <div>
              <span className="inline-block text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded px-2 py-0.5">
                {subscription.plan?.name || t('subscriptions.plan')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('subscriptions.start_date')}: {subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : t('common.not_available')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t('subscriptions.end_date')}: {subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : t('common.not_available')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" />
              </svg>
              <span>{t('subscriptions.price_per_month')}: ${subscription.price_per_month || 0}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>ID: {subscription.id}</span>
              <span>{t('subscriptions.subscription')}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
