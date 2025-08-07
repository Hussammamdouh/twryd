import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function SubscriptionRequestsTableFooter({ data, totalData }) {
  const { t } = useLanguage();

  return (
    <div className="px-6 lg:px-8 py-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('subscription_requests.showing_results', { 
            from: data.length > 0 ? 1 : 0, 
            to: data.length, 
            total: totalData.length 
          })}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {t('subscription_requests.total_requests', { count: totalData.length })}
        </div>
      </div>
    </div>
  );
}
