import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { get } from '../../utils/api';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Spinner from '../../UI/supplier/Spinner';

export default function SupplierCurrentSubscription({ subscriptionData, onRefresh }) {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(false);

  // Extract data from the new API response structure
  const subscription = subscriptionData?.subscription;
  const hasActiveSubscription = subscriptionData?.has_active_subscription;
  const status = subscription?.status || 'undefined';
  const plan = subscription?.plan;
  const remainingSlots = subscriptionData?.remaining_slots || 0;
  const remainingDays = subscriptionData?.remaining_days || 0;
  const currentClientCount = subscriptionData?.current_client_count || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'expired':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'cancelled':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30';
      default:
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'expired':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!hasActiveSubscription || !subscription) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('supplier_subscriptions.no_active_subscription')}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {t('supplier_subscriptions.no_subscription_description')}
        </p>
        <button
          onClick={() => {
            // Navigate to plans tab
            // This will be handled by the parent component
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('supplier_subscriptions.browse_plans')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('supplier_subscriptions.current_subscription')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('supplier_subscriptions.subscription_details_description')}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          {loading ? (
            <Spinner size={16} />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {t('common.refresh')}
        </button>
      </div>

      {/* Subscription Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('supplier_subscriptions.status')}
              </h3>
              <p className={`text-sm font-medium ${getStatusColor(status).split(' ')[0]}`}>
                {t(`supplier_subscriptions.status_${status}`)}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('supplier_subscriptions.plan')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {plan?.name || t('supplier_subscriptions.no_plan')}
              </p>
            </div>
          </div>
        </div>

        {/* Price Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('supplier_subscriptions.monthly_price')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ${plan?.price_per_month || 0} {t('supplier_subscriptions.per_month')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Subscription Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('supplier_subscriptions.detailed_information')}
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subscription Details */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                {t('supplier_subscriptions.subscription_details')}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.subscription_id')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{subscription.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.start_date')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.start_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.end_date')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(subscription.end_date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.remaining_days')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {remainingDays > 0 ? remainingDays : 0} {t('supplier_subscriptions.days')}
                  </span>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                {t('supplier_subscriptions.plan_details')}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.plan_name')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{plan?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.max_clients')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{plan?.max_clients}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.current_clients')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentClientCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.remaining_slots')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{remainingSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.price_per_month')}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${plan?.price_per_month || 0} {t('supplier_subscriptions.per_month')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => {
            // Navigate to plans tab
            // This will be handled by the parent component
          }}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {t('supplier_subscriptions.browse_other_plans')}
        </button>
        <button
          onClick={() => {
            // Navigate to subscription requests tab
            // This will be handled by the parent component
          }}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('supplier_subscriptions.request_renewal')}
        </button>
      </div>
    </div>
  );
} 