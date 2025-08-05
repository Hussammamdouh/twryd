import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { get } from '../../utils/api';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import SupplierPlans from './SupplierPlans';
import SupplierCurrentSubscription from './SupplierCurrentSubscription';
import SupplierSubscriptionRequests from './SupplierSubscriptionRequests';

export default function SupplierSubscriptions() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('current');
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch subscription status on component mount
  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await get('/api/supplier/subscriptions/status', { token });
      console.log('Subscription status response:', response);
      setSubscriptionData(response.data);
    } catch (err) {
      console.error('Failed to fetch subscription status:', err);
      toast.show(t('messages.failed_to_load'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: 'current',
      name: t('supplier_subscriptions.current_subscription'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'plans',
      name: t('supplier_subscriptions.available_plans'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      id: 'requests',
      name: t('supplier_subscriptions.subscription_requests'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  if (loading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  // Extract subscription info from the API response structure
  const subscription = subscriptionData?.subscription;
  const hasActiveSubscription = subscriptionData?.has_active_subscription;
  const status = subscription?.status || 'undefined';

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('supplier_subscriptions.title')}</h1>
            <p className="text-blue-100 text-sm sm:text-base">{t('supplier_subscriptions.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Subscription Status Card */}
      {subscriptionData && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${
                status === 'active' 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : status === 'expired'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-yellow-100 dark:bg-yellow-900/30'
              }`}>
                <svg className={`w-6 h-6 ${
                  status === 'active' 
                    ? 'text-green-600 dark:text-green-400' 
                    : status === 'expired'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('supplier_subscriptions.current_status')}
                </h3>
                <p className={`text-sm font-medium ${
                  status === 'active' 
                    ? 'text-green-600 dark:text-green-400' 
                    : status === 'expired'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  {t(`supplier_subscriptions.status_${status}`)}
                </p>
              </div>
            </div>
            {subscription?.plan && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('supplier_subscriptions.current_plan')}</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{subscription.plan.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Subscription management tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.icon}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'current' && (
            <SupplierCurrentSubscription 
              subscriptionData={subscriptionData}
              onRefresh={fetchSubscriptionStatus}
            />
          )}
          {activeTab === 'plans' && (
            <SupplierPlans />
          )}
          {activeTab === 'requests' && (
            <SupplierSubscriptionRequests 
              onRefresh={fetchSubscriptionStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
} 