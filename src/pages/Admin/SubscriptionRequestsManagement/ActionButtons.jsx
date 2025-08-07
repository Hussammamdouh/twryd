import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

export default function ActionButtons({ request, onApprove, onReject, rowLoading, actionResult }) {
  const { t } = useLanguage();

  const handleApprove = () => {
    if (request.status === 'pending') {
      onApprove(request);
    }
  };

  const handleReject = () => {
    if (request.status === 'pending') {
      onReject(request);
    }
  };

  if (request.status !== 'pending') {
    return (
      <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
        {request.status === 'approved' 
          ? t('subscription_requests.already_approved') 
          : t('subscription_requests.already_rejected')
        }
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={rowLoading[request.id]}
        className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg shadow-sm text-sm font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {t('subscription_requests.approve')}
      </button>
      
      <button
        onClick={handleReject}
        disabled={rowLoading[request.id]}
        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg shadow-sm text-sm font-semibold hover:bg-red-200 dark:hover:bg-red-800/50 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        {t('subscription_requests.reject')}
      </button>
      
      {rowLoading[request.id] && (
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      )}
      
      {actionResult[request.id] === 'success' && !rowLoading[request.id] && (
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {actionResult[request.id] === 'error' && !rowLoading[request.id] && (
        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )}
    </div>
  );
}
