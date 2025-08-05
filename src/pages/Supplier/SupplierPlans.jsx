import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../UI/Common/ToastContext';
import { useSupplierTranslation } from '../../hooks/useSupplierTranslation';
import { get } from '../../utils/api';
import LoadingSkeleton from '../../UI/Common/LoadingSkeleton';
import Spinner from '../../UI/supplier/Spinner';

export default function SupplierPlans() {
  const { token } = useAuth();
  const toast = useToast();
  const { t } = useSupplierTranslation();
  
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await get('/api/supplier/plans', { token });
      setPlans(response.data?.plans || response.data || []);
    } catch (err) {
      console.error('Failed to fetch plans:', err);
      toast.show(t('subscriptions.failed_to_load_plans'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlanDetails = async (planId) => {
    try {
      const response = await get(`/api/supplier/plans/${planId}`, { token });
      setSelectedPlan(response.data);
      setShowPlanDetails(true);
    } catch (err) {
      console.error('Failed to fetch plan details:', err);
      toast.show(t('subscriptions.failed_to_load_plans'), 'error');
    }
  };

  const handleClosePlanDetails = () => {
    setShowPlanDetails(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return (
      <div className="w-full">
        <LoadingSkeleton type="dashboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('subscriptions.available_plans')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('subscriptions.plans_description')}
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('subscriptions.no_plans_available')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subscriptions.no_plans_description')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              {/* Plan Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {plan.is_custom && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs font-medium rounded-full">
                      {t('subscriptions.custom_plan')}
                    </span>
                  )}
                </div>
                
                {/* Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price_per_month}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('subscriptions.per_month')}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('subscriptions.max_clients', { count: plan.max_clients })}
                    </span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Plan Actions */}
              <div className="p-6">
                <button
                  onClick={() => handleViewPlanDetails(plan.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {t('subscriptions.view_details')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan Details Modal */}
      {showPlanDetails && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedPlan.name}
                  </h3>
                  {selectedPlan.is_custom && (
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm font-medium rounded-full">
                      {t('subscriptions.custom_plan')}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleClosePlanDetails}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Price Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${selectedPlan.price_per_month}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">
                    {t('subscriptions.per_month')}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedPlan.description && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t('subscriptions.description')}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedPlan.description}
                  </p>
                </div>
              )}

              {/* Features */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {t('subscriptions.features')}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('subscriptions.max_clients', { count: selectedPlan.max_clients })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('subscriptions.full_platform_access')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {t('subscriptions.priority_support')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={handleClosePlanDetails}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {t('subscriptions.close')}
              </button>
              <button
                onClick={() => {
                  handleClosePlanDetails();
                  // Navigate to subscription requests tab
                  // This will be handled by the parent component
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {t('subscriptions.request_subscription')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 