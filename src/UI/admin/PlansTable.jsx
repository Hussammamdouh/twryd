import React from 'react';
import StatusBadge from '../supplier/StatusBadge';
import Spinner from '../supplier/Spinner';
import ConfirmActionModal from '../supplier/ConfirmActionModal';
import { useState } from 'react';

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

export default function PlansTable({ 
  plans, 
  onEdit, 
  onDelete, 
  recentlyUpdated = {}, 
  actionResult = {}, 
  rowLoading = {} 
}) {
  const [confirm, setConfirm] = useState({ open: false, plan: null });

  const handleDelete = (plan) => {
    setConfirm({ open: true, plan });
  };

  const confirmDelete = () => {
    if (confirm.plan) {
      onDelete(confirm.plan);
    }
    setConfirm({ open: false, plan: null });
  };

  const closeConfirm = () => setConfirm({ open: false, plan: null });

  if (!plans || plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0A9 9 0 11.75 12a9 9 0 0117.25 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No plans found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first subscription plan to get started with managing supplier subscriptions.</p>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Start by creating a basic plan with standard pricing, then customize it based on your suppliers' needs.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white dark:bg-gray-900" role="table" aria-label="Plans Table">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700" role="rowgroup">
            <tr className="h-14" role="row">
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Plan Name
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Type
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Max Clients
                </div>
              </th>
              <th className="px-4 md:px-6 py-4 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600" role="columnheader">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Price/Month
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
                  Created
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
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className={`group hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/10 dark:hover:to-purple-900/10 transition-all duration-300 ${
                  recentlyUpdated[plan.id] 
                    ? (actionResult[plan.id] === 'success' 
                        ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' 
                        : 'ring-2 ring-red-400 bg-red-50 dark:bg-red-900/20') 
                    : ''
                }`}
                role="row"
                tabIndex={0}
                aria-label={`Plan: ${plan.name}, Type: ${plan.is_custom ? 'Custom' : 'Standard'}, Price: ${formatCurrency(plan.price_per_month)}`}
              >
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.is_custom 
                        ? 'bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30' 
                        : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        plan.is_custom 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-blue-600 dark:text-blue-400'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {plan.name || 'N/A'}
                      </div>
                      {plan.description && (
                        <div className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-xs mt-1">
                          {plan.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <StatusBadge 
                    status={plan.is_custom ? 'custom' : 'standard'} 
                    aria-label={plan.is_custom ? 'Custom Plan' : 'Standard Plan'}
                  />
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {plan.max_clients ? plan.max_clients.toLocaleString() : 'Unlimited'}
                    </span>
                    {!plan.max_clients && (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(plan.price_per_month)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <StatusBadge 
                    status={plan.is_active ? 'active' : 'inactive'} 
                    aria-label={plan.is_active ? 'Active' : 'Inactive'}
                  />
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="text-gray-900 dark:text-white">
                    {formatDate(plan.created_at)}
                  </div>
                </td>
                <td className="px-4 md:px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40 text-blue-700 dark:text-blue-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                      onClick={() => onEdit(plan)}
                      disabled={rowLoading[plan.id]}
                      tabIndex={0}
                      aria-label={`Edit plan ${plan.name}`}
                      title="Edit Plan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/40 text-red-700 dark:text-red-300 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
                      onClick={() => handleDelete(plan)}
                      disabled={rowLoading[plan.id]}
                      tabIndex={0}
                      aria-label={`Delete plan ${plan.name}`}
                      title="Delete Plan"
                    >
                      {rowLoading[plan.id] ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                    {actionResult[plan.id] === 'success' && !rowLoading[plan.id] && (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-medium">Success</span>
                      </div>
                    )}
                    {actionResult[plan.id] === 'error' && !rowLoading[plan.id] && (
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
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete the plan "${confirm.plan?.name}"? This action cannot be undone and will affect any suppliers currently subscribed to this plan.`}
        confirmText="Delete Plan"
        confirmColor="red"
        loading={rowLoading[confirm.plan?.id]}
      />
    </div>
  );
} 