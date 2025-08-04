import React, { useState } from 'react';
import StatusBadge from '../supplier/StatusBadge';
import Spinner from '../supplier/Spinner';
import ConfirmActionModal from '../supplier/ConfirmActionModal';
import ExtendSubscriptionModal from './ExtendSubscriptionModal';

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
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

// Helper function to get days remaining
const getDaysRemaining = (endDate) => {
  if (!endDate) return null;
  try {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return null;
  }
};

export default function SubscriptionsTable({ 
  subscriptions, 
  onEdit, 
  onCancel, 
  onReactivate, 
  onExtend,
  recentlyUpdated = {}, 
  actionResult = {}, 
  rowLoading = {} 
}) {
  const [confirm, setConfirm] = useState({ open: false, subscription: null, action: null });
  const [extendModal, setExtendModal] = useState({ open: false, subscription: null });

  const handleCancel = (subscription) => {
    setConfirm({ open: true, subscription, action: 'cancel' });
  };

  const handleReactivate = (subscription) => {
    setConfirm({ open: true, subscription, action: 'reactivate' });
  };

  const handleExtend = (subscription) => {
    setExtendModal({ open: true, subscription });
  };

  const confirmAction = () => {
    if (confirm.subscription) {
      if (confirm.action === 'cancel') {
        onCancel(confirm.subscription);
      } else if (confirm.action === 'reactivate') {
        onReactivate(confirm.subscription);
      }
    }
    setConfirm({ open: false, subscription: null, action: null });
  };

  const closeConfirm = () => setConfirm({ open: false, subscription: null, action: null });

  const handleExtendSubmit = (months) => {
    if (extendModal.subscription) {
      onExtend(extendModal.subscription, months);
    }
    setExtendModal({ open: false, subscription: null });
  };

  const closeExtendModal = () => setExtendModal({ open: false, subscription: null });

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0A9 9 0 11.75 12a9 9 0 0117.25 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No subscriptions found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first subscription to start managing supplier billing and access.</p>
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              <strong>Tip:</strong> Subscriptions allow you to manage supplier access to the platform and track billing cycles effectively.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="min-w-full text-sm bg-white dark:bg-gray-900" role="table" aria-label="Subscriptions Table">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700" role="rowgroup">
            <tr className="h-14" role="row">
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Supplier
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Plan
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Start Date
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  End Date
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Price
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Actions
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800" role="rowgroup">
            {subscriptions.map((subscription) => {
              const daysRemaining = getDaysRemaining(subscription.end_date);
              return (
                <tr
                  key={subscription.id}
                  className={`group hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/10 dark:hover:to-emerald-900/10 transition-all duration-300 ${
                    recentlyUpdated[subscription.id] 
                      ? (actionResult[subscription.id] === 'success' 
                          ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' 
                          : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') 
                      : ''
                  }`}
                  role="row"
                  tabIndex={0}
                  aria-label={`Subscription: ${subscription.supplier?.name || subscription.supplier?.company_name}, Plan: ${subscription.plan?.name}, Status: ${subscription.status}`}
                >
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {subscription.supplier?.name || subscription.supplier?.company_name || 'N/A'}
                        </div>
                        {subscription.supplier?.email && (
                          <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-xs">
                            {subscription.supplier.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        subscription.plan?.is_custom 
                          ? 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30' 
                          : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          subscription.plan?.is_custom 
                            ? 'text-orange-600 dark:text-orange-400' 
                            : 'text-blue-600 dark:text-blue-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {subscription.plan?.name || 'N/A'}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {subscription.plan?.is_custom ? 'Custom Plan' : 'Standard Plan'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <StatusBadge 
                        status={subscription.status} 
                        aria-label={`Status: ${subscription.status}`}
                      />
                      {daysRemaining !== null && subscription.status === 'active' && (
                        <div className={`text-xs font-medium ${
                          daysRemaining <= 7 ? 'text-red-600 dark:text-red-400' :
                          daysRemaining <= 30 ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired today'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-gray-900 dark:text-white">
                      {formatDate(subscription.start_date)}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-gray-900 dark:text-white">
                      {formatDate(subscription.end_date)}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          {formatCurrency(subscription.price_per_month)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">/month</span>
                      </div>
                      {subscription.price_per_month && (
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                        onClick={() => onEdit(subscription)}
                        disabled={rowLoading[subscription.id]}
                        tabIndex={0}
                        aria-label={`Edit subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                        title="Edit Subscription"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {subscription.status === 'active' && (
                        <button
                          className="p-2 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:hover:bg-yellow-800/40 text-yellow-700 dark:text-yellow-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm"
                          onClick={() => handleExtend(subscription)}
                          disabled={rowLoading[subscription.id]}
                          tabIndex={0}
                          aria-label={`Extend subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                          title="Extend Subscription"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0A9 9 0 11.75 12a9 9 0 0117.25 0z" />
                          </svg>
                        </button>
                      )}
                      
                      {subscription.status === 'active' && (
                        <button
                          className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                          onClick={() => handleCancel(subscription)}
                          disabled={rowLoading[subscription.id]}
                          tabIndex={0}
                          aria-label={`Cancel subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                          title="Cancel Subscription"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                      
                      {subscription.status === 'cancelled' && (
                        <button
                          className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40 text-green-700 dark:text-green-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                          onClick={() => handleReactivate(subscription)}
                          disabled={rowLoading[subscription.id]}
                          tabIndex={0}
                          aria-label={`Reactivate subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                          title="Reactivate Subscription"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                      
                      {rowLoading[subscription.id] && (
                        <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="text-xs font-medium">Processing</span>
                        </div>
                      )}
                      
                      {actionResult[subscription.id] === 'success' && !rowLoading[subscription.id] && (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-xs font-medium">Success</span>
                        </div>
                      )}
                      
                      {actionResult[subscription.id] === 'error' && !rowLoading[subscription.id] && (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-xs font-medium">Error</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={confirmAction}
        title={confirm.action === 'cancel' ? 'Cancel Subscription' : 'Reactivate Subscription'}
        message={
          confirm.action === 'cancel' 
            ? `Are you sure you want to cancel the subscription for "${confirm.subscription?.supplier?.name || confirm.subscription?.supplier?.company_name}"? This will immediately revoke their access to the platform.`
            : `Are you sure you want to reactivate the subscription for "${confirm.subscription?.supplier?.name || confirm.subscription?.supplier?.company_name}"? This will restore their access to the platform.`
        }
        confirmText={confirm.action === 'cancel' ? 'Cancel Subscription' : 'Reactivate Subscription'}
        confirmColor={confirm.action === 'cancel' ? 'red' : 'green'}
        loading={rowLoading[confirm.subscription?.id]}
      />

      {/* Extend Subscription Modal */}
      <ExtendSubscriptionModal
        open={extendModal.open}
        onClose={closeExtendModal}
        onSubmit={handleExtendSubmit}
        subscription={extendModal.subscription}
      />
    </div>
  );
} 