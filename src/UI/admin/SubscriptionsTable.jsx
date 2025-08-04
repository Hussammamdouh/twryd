import React, { useState } from 'react';
import StatusBadge from '../supplier/StatusBadge';
import Spinner from '../supplier/Spinner';
import ConfirmActionModal from '../supplier/ConfirmActionModal';
import ExtendSubscriptionModal from './ExtendSubscriptionModal';

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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4 animate-fade-in">
        <svg className="w-12 h-12 mb-2 text-blue-200 dark:text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="text-lg font-semibold">No subscriptions found.</div>
        <p className="text-sm">Create your first subscription to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm md:table bg-white dark:bg-gray-900 rounded-lg shadow-md" role="table" aria-label="Subscriptions Table">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200" role="rowgroup">
          <tr className="h-12" role="row">
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Supplier</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Plan</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Start Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">End Date</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Price</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
          {subscriptions.map((subscription) => (
            <tr
              key={subscription.id}
              className={`border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 ${
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
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {subscription.supplier?.name || subscription.supplier?.company_name || 'N/A'}
                  </div>
                  {subscription.supplier?.email && (
                    <div className="text-gray-500 dark:text-gray-300 text-xs">
                      {subscription.supplier.email}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {subscription.plan?.name || 'N/A'}
                  </div>
                  <div className="text-gray-500 dark:text-gray-300 text-xs">
                    {subscription.plan?.is_custom ? 'Custom Plan' : 'Standard Plan'}
                  </div>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4">
                <StatusBadge 
                  status={subscription.status} 
                  aria-label={`Status: ${subscription.status}`}
                />
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatDate(subscription.start_date)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatDate(subscription.end_date)}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatCurrency(subscription.price_per_month)}
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2 items-center">
                <button
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded shadow text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
                  onClick={() => onEdit(subscription)}
                  disabled={rowLoading[subscription.id]}
                  tabIndex={0}
                  aria-label={`Edit subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                >
                  Edit
                </button>
                
                {subscription.status === 'active' && (
                  <button
                    className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded shadow text-xs font-bold hover:bg-yellow-200 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors duration-150"
                    onClick={() => handleExtend(subscription)}
                    disabled={rowLoading[subscription.id]}
                    tabIndex={0}
                    aria-label={`Extend subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                  >
                    Extend
                  </button>
                )}
                
                {subscription.status === 'active' && (
                  <button
                    className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                    onClick={() => handleCancel(subscription)}
                    disabled={rowLoading[subscription.id]}
                    tabIndex={0}
                    aria-label={`Cancel subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                  >
                    Cancel
                  </button>
                )}
                
                {subscription.status === 'cancelled' && (
                  <button
                    className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded shadow text-xs font-bold hover:bg-green-200 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-150"
                    onClick={() => handleReactivate(subscription)}
                    disabled={rowLoading[subscription.id]}
                    tabIndex={0}
                    aria-label={`Reactivate subscription for ${subscription.supplier?.name || subscription.supplier?.company_name}`}
                  >
                    Reactivate
                  </button>
                )}
                
                {rowLoading[subscription.id] && (
                  <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                
                {actionResult[subscription.id] === 'success' && !rowLoading[subscription.id] && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionResult[subscription.id] === 'error' && !rowLoading[subscription.id] && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={confirmAction}
        title={confirm.action === 'cancel' ? 'Cancel Subscription' : 'Reactivate Subscription'}
        message={
          confirm.action === 'cancel' 
            ? `Are you sure you want to cancel the subscription for "${confirm.subscription?.supplier?.name || confirm.subscription?.supplier?.company_name}"? This action cannot be undone.`
            : `Are you sure you want to reactivate the subscription for "${confirm.subscription?.supplier?.name || confirm.subscription?.supplier?.company_name}"?`
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