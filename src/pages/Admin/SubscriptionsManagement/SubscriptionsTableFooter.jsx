import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function SubscriptionsTableFooter({ data, totalData }) {
  const { t } = useLanguage();

  return (
    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            {t('subscriptions.showing', { 
              from: data.length > 0 ? 1 : 0, 
              to: data.length, 
              total: totalData.length 
            })}
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <span>{t('subscriptions.active')}: {totalData.filter(sub => sub.status === 'active').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>{t('subscriptions.expired')}: {totalData.filter(sub => sub.status === 'expired').length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>{t('subscriptions.cancelled')}: {totalData.filter(sub => sub.status === 'cancelled').length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
