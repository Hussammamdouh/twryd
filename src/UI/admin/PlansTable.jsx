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
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4 animate-fade-in">
        <svg className="w-12 h-12 mb-2 text-blue-200 dark:text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="text-lg font-semibold">No plans found.</div>
        <p className="text-sm">Create your first subscription plan to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm md:table bg-white dark:bg-gray-900 rounded-lg shadow-md" role="table" aria-label="Plans Table">
        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200" role="rowgroup">
          <tr className="h-12" role="row">
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Plan Name</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Type</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Max Clients</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Price/Month</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Status</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Created</th>
            <th className="px-4 md:px-6 py-3 text-left font-semibold border-b border-gray-200 dark:border-gray-700" role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900" role="rowgroup">
          {plans.map((plan) => (
            <tr
              key={plan.id}
              className={`border-b border-gray-100 dark:border-gray-800 transition-colors duration-300 ${
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
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {plan.name || 'N/A'}
                  </div>
                  {plan.description && (
                    <div className="text-gray-500 dark:text-gray-300 text-xs truncate max-w-xs">
                      {plan.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                <StatusBadge 
                  status={plan.is_custom ? 'custom' : 'standard'} 
                  aria-label={plan.is_custom ? 'Custom Plan' : 'Standard Plan'}
                />
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {plan.max_clients ? plan.max_clients.toLocaleString() : 'Unlimited'}
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatCurrency(plan.price_per_month)}
              </td>
              <td className="px-4 md:px-6 py-4">
                <StatusBadge 
                  status={plan.is_active ? 'active' : 'inactive'} 
                  aria-label={plan.is_active ? 'Active' : 'Inactive'}
                />
              </td>
              <td className="px-4 md:px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">
                {formatDate(plan.created_at)}
              </td>
              <td className="px-4 md:px-6 py-4 flex flex-wrap gap-2 items-center">
                <button
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded shadow text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-150"
                  onClick={() => onEdit(plan)}
                  disabled={rowLoading[plan.id]}
                  tabIndex={0}
                  aria-label={`Edit plan ${plan.name}`}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded shadow text-xs font-bold hover:bg-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors duration-150"
                  onClick={() => handleDelete(plan)}
                  disabled={rowLoading[plan.id]}
                  tabIndex={0}
                  aria-label={`Delete plan ${plan.name}`}
                >
                  {rowLoading[plan.id] ? (
                    <svg className="w-4 h-4 animate-spin text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : 'Delete'}
                </button>
                {actionResult[plan.id] === 'success' && !rowLoading[plan.id] && (
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {actionResult[plan.id] === 'error' && !rowLoading[plan.id] && (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmActionModal
        isOpen={confirm.open}
        onClose={closeConfirm}
        onConfirm={confirmDelete}
        title="Delete Plan"
        message={`Are you sure you want to delete the plan "${confirm.plan?.name}"? This action cannot be undone.`}
        confirmText="Delete Plan"
        confirmColor="red"
        loading={rowLoading[confirm.plan?.id]}
      />
    </div>
  );
} 